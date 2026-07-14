"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
        exposedHeaders: ['Content-Disposition'],
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    const clientCandidates = [
        process.env.CLIENT_DIR,
        (0, path_1.join)(__dirname, '..', 'client'),
        (0, path_1.join)(process.cwd(), 'client'),
        (0, path_1.join)(__dirname, '..', '..', 'web', 'out'),
    ].filter(Boolean);
    const clientDir = clientCandidates.find((dir) => (0, fs_1.existsSync)((0, path_1.join)(dir, 'index.html')));
    if (clientDir) {
        app.useStaticAssets(clientDir);
        const expressApp = app.getHttpAdapter().getInstance();
        expressApp.use((req, res, next) => {
            if (req.method !== 'GET' && req.method !== 'HEAD')
                return next();
            if (req.path.startsWith('/api'))
                return next();
            if (req.path.includes('.'))
                return next();
            return res.sendFile((0, path_1.join)(clientDir, 'index.html'));
        });
        console.log(`Serving UI from ${clientDir}`);
    }
    const host = process.env.API_HOST || '0.0.0.0';
    const port = Number(process.env.API_PORT || 3847);
    await app.listen(port, host);
    console.log(`Jewelry ERP API listening on http://${host}:${port}/api/v1`);
}
bootstrap();
//# sourceMappingURL=main.js.map