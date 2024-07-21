import { z } from 'zod';

export const qs = z.enum(['info', 'warn']);

export const positive = z.number().positive();

export const per = z.object({
  qss: z.array(qs),
  atpid: positive,
});

export const er = z.object({
  rid: positive,
  atqg: z.array(positive),
  atpid: positive,
  per,
});

export const ers = z.array(er);

export const errorObj = z
  .object({
    message: z.string(),
  })
  .strict();
