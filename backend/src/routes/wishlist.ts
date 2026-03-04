import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const wishlistInclude = {
  items: {
    include: {
      product: { include: { variants: true, reviews: { select: { rating: true } } } },
    },
  },
};

async function getOrCreateWishlist(userId: string) {
  let wishlist = await prisma.wishlist.findUnique({ where: { userId }, include: wishlistInclude });
  if (!wishlist) wishlist = await prisma.wishlist.create({ data: { userId }, include: wishlistInclude });
  return wishlist;
}

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const wishlist = await getOrCreateWishlist(req.user!.id);
  res.json(wishlist);
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { productId } = req.body;
  const wishlist = await getOrCreateWishlist(req.user!.id);
  const existing = await prisma.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
  });
  if (!existing) {
    await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
  }
  const updated = await prisma.wishlist.findUnique({ where: { userId: req.user!.id }, include: wishlistInclude });
  res.json(updated);
});

router.delete('/:productId', authenticate, async (req: AuthRequest, res: Response) => {
  const wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user!.id } });
  if (wishlist) {
    await prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, productId: req.params.productId },
    });
  }
  const updated = await getOrCreateWishlist(req.user!.id);
  res.json(updated);
});

export default router;
