import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/product/:productId', async (req: Request, res: Response) => {
  const reviews = await prisma.review.findMany({
    where: { productId: req.params.productId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(reviews);
});

router.post('/product/:productId', authenticate, async (req: AuthRequest, res: Response) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

  const review = await prisma.review.upsert({
    where: { userId_productId: { userId: req.user!.id, productId: req.params.productId } },
    update: { rating: parseInt(rating), comment: comment || '' },
    create: { userId: req.user!.id, productId: req.params.productId, rating: parseInt(rating), comment: comment || '' },
    include: { user: { select: { id: true, name: true } } },
  });
  res.json(review);
});

export default router;
