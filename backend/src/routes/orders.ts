import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const orderInclude = {
  items: {
    include: {
      product: { select: { id: true, name: true, images: true, slug: true } },
      variant: true,
    },
  },
  shippingAddress: true,
  coupon: { select: { code: true, type: true, value: true } },
};

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { shippingAddressId, couponCode, items, paymentMethod = 'MOCK' } = req.body;

  if (!items || !items.length) return res.status(400).json({ error: 'No items' });

  // Validate coupon
  let coupon = null;
  if (couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase(), active: true } });
    if (!coupon) return res.status(400).json({ error: 'Invalid coupon' });
  }

  // Calculate total
  let subtotal = 0;
  const orderItems = [];
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) return res.status(400).json({ error: `Product ${item.productId} not found` });
    const price = product.price * item.quantity;
    subtotal += price;
    orderItems.push({ productId: item.productId, variantId: item.variantId || null, quantity: item.quantity, price: product.price });
  }

  let discount = 0;
  if (coupon) {
    if (subtotal < coupon.minOrder) return res.status(400).json({ error: `Minimum order for this coupon is $${coupon.minOrder}` });
    discount = coupon.type === 'PERCENT' ? subtotal * (coupon.value / 100) : coupon.value;
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: 'Coupon usage limit reached' });
  }

  const total = Math.max(0, subtotal - discount);

  const order = await prisma.order.create({
    data: {
      userId: req.user!.id,
      total,
      shippingAddressId: shippingAddressId || null,
      couponId: coupon?.id || null,
      paymentMethod,
      items: { create: orderItems },
    },
    include: orderInclude,
  });

  if (coupon) {
    await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
  }

  // Decrement stock for variants
  for (const item of items) {
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }

  // Clear cart
  const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  res.json(order);
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    include: orderInclude,
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

export default router;
