import { prisma } from '../lib/prisma';

export async function getProducts(query: any) {
  // TODO: Implement proper pagination, filtering by tag, and searching by query (q)
  const { tag, q, page = 1, limit = 10 } = query;

  const products = await prisma.product.findMany({
    where: {
      active: true,
      stock: {
        gt: 0,
      },
      ...(tag && { tags: { has: tag } }),
      ...(q && {
        // A simple search on name/description in the JSON field.
        // For production, a more robust search solution is recommended (e.g., full-text search).
        OR: [
            { i18n: { path: ['fr-MA', 'name'], string_contains: q } },
            { i18n: { path: ['ar-MA', 'name'], string_contains: q } },
        ]
      }),
    },
    select: {
      id: true,
      slug: true,
      priceMAD: true,
      images: true,
      i18n: true,
      tags: true,
    },
    take: parseInt(limit),
    skip: (parseInt(page) - 1) * parseInt(limit),
  });

  return products;
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: {
      slug,
      active: true,
    },
  });
  return product;
}
