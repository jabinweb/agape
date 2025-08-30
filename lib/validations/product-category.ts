import { z } from 'zod';

// Schema for product category validation
export const productCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(1000).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

export type ProductCategoryInput = z.infer<typeof productCategorySchema>;

// Schema for product category update validation
export const productCategoryUpdateSchema = productCategorySchema.partial();

export type ProductCategoryUpdateInput = z.infer<typeof productCategoryUpdateSchema>;
