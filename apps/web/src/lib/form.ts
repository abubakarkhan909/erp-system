import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import type { z } from 'zod';

export type FormInput<T extends z.ZodTypeAny> = z.input<T>;
export type FormOutput<T extends z.ZodTypeAny> = z.output<T>;

/** Bridge Zod input/output inference gaps (e.g. `.default()`) with React Hook Form. */
export function formResolver<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
): Resolver<FormInput<TSchema>> {
  return zodResolver(schema) as Resolver<FormInput<TSchema>>;
}
