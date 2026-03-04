import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req: Request, res: Response) => {
  const settings = await prisma.themeSetting.findMany();
  const theme: Record<string, string> = {};
  settings.forEach(s => { theme[s.key] = s.value; });
  res.json(theme);
});

router.put('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const updates = req.body as Record<string, string>;
  for (const [key, value] of Object.entries(updates)) {
    await prisma.themeSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }
  const settings = await prisma.themeSetting.findMany();
  const theme: Record<string, string> = {};
  settings.forEach(s => { theme[s.key] = s.value; });
  res.json(theme);
});

export default router;
