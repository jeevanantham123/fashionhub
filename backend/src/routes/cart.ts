import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const cartInclude = {
  items: {
    include: {
      product: { select: { id: true, name: true, slug: true, images: true, price: true } },
      variant: true,
    },
  },
};

async function getOrCreateCart(userId?: string, sessionId?: string) {
  if (userId) {
    let cart = await prisma.cart.findUnique({ where: { userId }, include: cartInclude });
    if (!cart) cart = await prisma.cart.create({ data: { userId }, include: cartInclude });
    return cart;
  }
  if (sessionId) {
    let cart = await prisma.cart.findUnique({ where: { sessionId }, include: cartInclude });
    if (!cart) cart = await prisma.cart.create({ data: { sessionId }, include: cartInclude });
    return cart;
  }
  return null;
}

router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  const sessionId = req.headers['x-session-id'] as string;
  const cart = await getOrCreateCart(req.user?.id, sessionId);
  res.json(cart);
});

router.post('/items', optionalAuth, async (req: AuthRequest, res: Response) => {
  const { productId, variantId, quantity = 1 } = req.body;
  const sessionId = req.headers['x-session-id'] as string;
  const cart = await getOrCreateCart(req.user?.id, sessionId);
  if (!cart) return res.status(400).json({ error: 'No session' });

  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, variantId: variantId || null },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, productId, variantId: variantId || null, quantity } });
  }

  const updated = await prisma.cart.findUnique({ where: { id: cart.id }, include: cartInclude });
  res.json(updated);
});

router.put('/items/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  const { quantity } = req.body;
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
  } else {
    await prisma.cartItem.update({ where: { id: req.params.id }, data: { quantity } });
  }
  const sessionId = req.headers['x-session-id'] as string;
  const cart = await getOrCreateCart(req.user?.id, sessionId);
  res.json(cart);
});

router.delete('/items/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  await prisma.cartItem.delete({ where: { id: req.params.id } });
  const sessionId = req.headers['x-session-id'] as string;
  const cart = await getOrCreateCart(req.user?.id, sessionId);
  res.json(cart);
});

router.delete('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  const sessionId = req.headers['x-session-id'] as string;
  const cart = await getOrCreateCart(req.user?.id, sessionId);
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  res.json({ ok: true });
});

// Merge guest cart into user cart on login
router.post('/merge', authenticate, async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.json({ ok: true });

  const guestCart = await prisma.cart.findUnique({ where: { sessionId }, include: { items: true } });
  if (!guestCart) return res.json({ ok: true });

  let userCart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
  if (!userCart) {
    userCart = await prisma.cart.create({ data: { userId: req.user!.id } });
  }

  for (const item of guestCart.items) {
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: userCart.id, productId: item.productId, variantId: item.variantId },
    });
    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + item.quantity } });
    } else {
      await prisma.cartItem.create({ data: { cartId: userCart.id, productId: item.productId, variantId: item.variantId, quantity: item.quantity } });
    }
  }
  await prisma.cart.delete({ where: { id: guestCart.id } });
  const updated = await prisma.cart.findUnique({ where: { id: userCart.id }, include: cartInclude });
  res.json(updated);
});

export default router;
