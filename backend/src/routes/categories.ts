import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    include: { children: true, _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(categories);
});

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { name, slug, image, parentId } = req.body;
  const category = await prisma.category.create({
    data: { name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), image, parentId: parentId || null },
  });
  res.json(category);
});

router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { name, slug, image, parentId } = req.body;
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: { name, slug, image, parentId: parentId || null },
  });
  res.json(category);
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
