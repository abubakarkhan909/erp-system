import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof StreamableFile) {
          return data;
        }
        if (data && typeof data === 'object' && 'success' in (data as object)) {
          return data;
        }
        if (data && typeof data === 'object' && 'data' in (data as object) && 'meta' in (data as object)) {
          return { success: true, ...(data as object) };
        }
        return { success: true, data };
      }),
    );
  }
}
