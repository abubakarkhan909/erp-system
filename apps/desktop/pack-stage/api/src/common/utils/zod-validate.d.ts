import { z } from 'zod';
export declare function zodValidate<T>(schema: z.ZodType<T>, data: unknown): T;
