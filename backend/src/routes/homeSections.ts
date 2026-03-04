import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req: Request, res: Response) => {
  const sections = await prisma.homeSection.findMany({ orderBy: { order: 'asc' } });
  res.json(sections);
});

router.get('/all', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  const sections = await prisma.homeSection.findMany({ orderBy: { order: 'asc' } });
  res.json(sections);
});

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { type, title, subtitle, content, imageUrl, buttonText, buttonLink, visible } = req.body;
  const count = await prisma.homeSection.count();
  const section = await prisma.homeSection.create({
    data: { type, title: title || '', subtitle: subtitle || '', content: content || null, imageUrl: imageUrl || null, buttonText: buttonText || null, buttonLink: buttonLink || null, order: count + 1, visible: visible !== false },
  });
  res.json(section);
});

router.put('/reorder', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { ids } = req.body as { ids: string[] };
  for (let i = 0; i < ids.length; i++) {
    await prisma.homeSection.update({ where: { id: ids[i] }, data: { order: i + 1 } });
  }
  const sections = await prisma.homeSection.findMany({ orderBy: { order: 'asc' } });
  res.json(sections);
});

router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { title, subtitle, content, imageUrl, buttonText, buttonLink, visible } = req.body;
  const section = await prisma.homeSection.update({
    where: { id: req.params.id },
    data: { title, subtitle, content, imageUrl, buttonText, buttonLink, visible },
  });
  res.json(section);
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  await prisma.homeSection.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
