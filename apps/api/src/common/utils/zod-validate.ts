import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

export function zodValidate<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new BadRequestException(message);
  }
  return result.data;
}
