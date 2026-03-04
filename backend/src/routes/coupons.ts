import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.post('/validate', async (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  const coupon = await prisma.coupon.findUnique({ where: { code: code?.toUpperCase(), active: true } });
  if (!coupon) return res.status(400).json({ error: 'Invalid or expired coupon' });
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ error: 'Coupon has expired' });
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: 'Coupon usage limit reached' });
  if (subtotal < coupon.minOrder) return res.status(400).json({ error: `Minimum order of $${coupon.minOrder} required` });
  const discount = coupon.type === 'PERCENT' ? subtotal * (coupon.value / 100) : coupon.value;
  res.json({ ...coupon, discount });
});

// Admin CRUD
router.get('/', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(coupons);
});

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { code, type, value, minOrder, maxUses, expiresAt } = req.body;
  const coupon = await prisma.coupon.create({
    data: { code: code.toUpperCase(), type, value: parseFloat(value), minOrder: parseFloat(minOrder) || 0, maxUses: maxUses ? parseInt(maxUses) : null, expiresAt: expiresAt ? new Date(expiresAt) : null },
  });
  res.json(coupon);
});

router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { code, type, value, minOrder, maxUses, expiresAt, active } = req.body;
  const coupon = await prisma.coupon.update({
    where: { id: req.params.id },
    data: { code: code?.toUpperCase(), type, value: value ? parseFloat(value) : undefined, minOrder: minOrder ? parseFloat(minOrder) : undefined, maxUses: maxUses !== undefined ? (maxUses ? parseInt(maxUses) : null) : undefined, expiresAt: expiresAt ? new Date(expiresAt) : null, active },
  });
  res.json(coupon);
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  await prisma.coupon.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
