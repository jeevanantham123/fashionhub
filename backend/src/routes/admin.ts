import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate, requireAdmin);

// Dashboard stats
router.get('/stats', async (_req: AuthRequest, res: Response) => {
  const [totalOrders, totalUsers, totalProducts, recentOrders] = await prisma.$transaction([
    prisma.order.count(),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.product.count({ where: { active: true } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { price: true, quantity: true } },
      },
    }),
  ]);

  const revenue = await prisma.order.aggregate({ _sum: { total: true } });

  // Revenue last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const revenueData = await prisma.order.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { total: true, createdAt: true },
  });

  // Group by day
  const dailyRevenue: Record<string, number> = {};
  revenueData.forEach(o => {
    const day = o.createdAt.toISOString().split('T')[0];
    dailyRevenue[day] = (dailyRevenue[day] || 0) + o.total;
  });

  // Low stock
  const lowStock = await prisma.productVariant.findMany({
    where: { stock: { lte: 5 } },
    include: { product: { select: { name: true } } },
  });

  // Top products
  const topProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  });
  const topProductDetails = await Promise.all(
    topProducts.map(async tp => {
      const product = await prisma.product.findUnique({ where: { id: tp.productId }, select: { id: true, name: true, images: true, price: true } });
      return { ...product, soldCount: tp._sum.quantity };
    })
  );

  res.json({ totalOrders, totalUsers, totalProducts, totalRevenue: revenue._sum.total || 0, recentOrders, dailyRevenue, lowStockCount: lowStock.length, topProducts: topProductDetails });
});

// All orders
router.get('/orders', async (req: AuthRequest, res: Response) => {
  const { status, page = '1', limit = '20', search } = req.query as any;
  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { id: { contains: search } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { quantity: true, price: true } },
        shippingAddress: true,
      },
    }),
    prisma.order.count({ where }),
  ]);
  res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

router.get('/orders/:id', async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: true, variant: true } },
      shippingAddress: true,
      coupon: true,
    },
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

router.put('/orders/:id/status', async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
  res.json(order);
});

// All users
router.get('/users', async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', search } = req.query as any;
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);
  res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

router.put('/users/:id/role', async (req: AuthRequest, res: Response) => {
  const { role } = req.body;
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { role } });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// Inventory
router.get('/inventory', async (_req: AuthRequest, res: Response) => {
  const variants = await prisma.productVariant.findMany({
    include: { product: { select: { id: true, name: true, images: true } } },
    orderBy: { stock: 'asc' },
  });
  res.json(variants);
});

router.put('/inventory/:variantId', async (req: AuthRequest, res: Response) => {
  const { stock } = req.body;
  const variant = await prisma.productVariant.update({
    where: { id: req.params.variantId },
    data: { stock: parseInt(stock) },
  });
  res.json(variant);
});

export default router;
