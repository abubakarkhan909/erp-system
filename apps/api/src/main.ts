import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Default CORS for browser + Electron + LAN
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition'],
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const clientCandidates = [
    process.env.CLIENT_DIR,
    join(__dirname, '..', 'client'),
    join(process.cwd(), 'client'),
    join(__dirname, '..', '..', 'web', 'out'),
  ].filter(Boolean) as string[];

  const clientDir = clientCandidates.find((dir) => existsSync(join(dir, 'index.html')));
  if (clientDir) {
    app.useStaticAssets(clientDir);
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use((req: { method: string; path: string }, res: { sendFile: (p: string) => void }, next: () => void) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      if (req.path.startsWith('/api')) return next();
      if (req.path.includes('.')) return next();
      return res.sendFile(join(clientDir, 'index.html'));
    });
    // eslint-disable-next-line no-console
    console.log(`Serving UI from ${clientDir}`);
  }

  const host = process.env.API_HOST || '0.0.0.0';
  const port = Number(process.env.API_PORT || 3847);
  await app.listen(port, host);
  // eslint-disable-next-line no-console
  console.log(`Jewelry ERP API listening on http://${host}:${port}/api/v1`);
}

bootstrap();
