import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  const {
    search, category, minPrice, maxPrice, size, color,
    featured, sort = 'createdAt_desc', page = '1', limit = '12', active
  } = req.query as any;

  const where: any = {};
  if (active !== 'false') where.active = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
    ];
  }
  if (category) {
    const cat = await prisma.category.findUnique({ where: { slug: category } });
    if (cat) {
      const subCats = await prisma.category.findMany({ where: { parentId: cat.id } });
      where.categoryId = { in: [cat.id, ...subCats.map(c => c.id)] };
    }
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }
  if (featured === 'true') where.featured = true;
  if (size || color) {
    where.variants = { some: {} };
    if (size) where.variants.some.size = size;
    if (color) where.variants.some.color = color;
  }

  const [field, dir] = sort.split('_');
  const orderBy: any = {};
  if (field === 'price') orderBy.price = dir;
  else if (field === 'createdAt') orderBy.createdAt = dir || 'desc';
  else orderBy.createdAt = 'desc';

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: parseInt(limit),
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
        reviews: { select: { rating: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const withRating = products.map(p => ({
    ...p,
    avgRating: p.reviews.length ? p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length : 0,
    reviewCount: p.reviews.length,
  }));

  if (sort === 'rating_desc') withRating.sort((a, b) => b.avgRating - a.avgRating);

  res.json({ products: withRating, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

router.get('/search-suggest', async (req: Request, res: Response) => {
  const { q } = req.query as any;
  if (!q || q.length < 2) return res.json([]);
  const products = await prisma.product.findMany({
    where: { name: { contains: q, mode: 'insensitive' }, active: true },
    select: { id: true, name: true, slug: true, images: true, price: true },
    take: 8,
  });
  res.json(products);
});

router.get('/:slug', async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: {
      category: true,
      variants: true,
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, active: true },
    take: 4,
    include: { variants: true, reviews: { select: { rating: true } } },
  });

  res.json({ ...product, related });
});

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { name, slug, description, price, comparePrice, images, categoryId, tags, featured, active, variants } = req.body;
  const product = await prisma.product.create({
    data: {
      name, slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: description || '', price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      images: images || [], categoryId, tags: tags || [], featured: !!featured, active: active !== false,
      variants: { create: (variants || []).map((v: any) => ({ size: v.size, color: v.color, stock: parseInt(v.stock) || 0, sku: v.sku || null })) },
    },
    include: { variants: true, category: true },
  });
  res.json(product);
});

router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { name, slug, description, price, comparePrice, images, categoryId, tags, featured, active, variants } = req.body;
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (slug !== undefined) updateData.slug = slug;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) updateData.price = parseFloat(price);
  if (comparePrice !== undefined) updateData.comparePrice = comparePrice ? parseFloat(comparePrice) : null;
  if (images !== undefined) updateData.images = images;
  if (categoryId !== undefined) updateData.categoryId = categoryId;
  if (tags !== undefined) updateData.tags = tags;
  if (featured !== undefined) updateData.featured = featured;
  if (active !== undefined) updateData.active = active;

  if (variants) {
    await prisma.productVariant.deleteMany({ where: { productId: req.params.id } });
    updateData.variants = { create: variants.map((v: any) => ({ size: v.size, color: v.color, stock: parseInt(v.stock) || 0, sku: v.sku || null })) };
  }

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: updateData,
    include: { variants: true, category: true },
  });
  res.json(product);
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  await prisma.product.update({ where: { id: req.params.id }, data: { active: false } });
  res.json({ ok: true });
});

export default router;
