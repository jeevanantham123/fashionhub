import { PrismaClient, Role, CouponType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fashion.com' },
    update: {},
    create: { email: 'admin@fashion.com', password: adminPassword, name: 'Admin User', role: Role.ADMIN },
  });

  await prisma.user.upsert({
    where: { email: 'staff@fashion.com' },
    update: {},
    create: { email: 'staff@fashion.com', password: staffPassword, name: 'Staff User', role: Role.ADMIN },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: { email: 'user@example.com', password: userPassword, name: 'Jane Doe', role: Role.USER },
  });

  // Additional customers
  for (let i = 1; i <= 7; i++) {
    const pw = await bcrypt.hash('pass123', 10);
    await prisma.user.upsert({
      where: { email: `customer${i}@example.com` },
      update: {},
      create: { email: `customer${i}@example.com`, password: pw, name: `Customer ${i}`, role: Role.USER },
    });
  }

  // Address for customer
  await prisma.address.deleteMany({ where: { userId: customer.id } });
  await prisma.address.create({
    data: { userId: customer.id, label: 'Home', street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'US', isDefault: true },
  });

  // Categories
  const categories = [
    { name: 'Tops', slug: 'tops', image: null },
    { name: 'Bottoms', slug: 'bottoms', image: null },
    { name: 'Dresses', slug: 'dresses', image: null },
    { name: 'Outerwear', slug: 'outerwear', image: null },
    { name: 'Shoes', slug: 'shoes', image: null },
    { name: 'Accessories', slug: 'accessories', image: null },
  ];

  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories[cat.slug] = c.id;
  }

  // Subcategories
  const subCategories = [
    { name: 'T-Shirts', slug: 't-shirts', parentId: createdCategories['tops'] },
    { name: 'Blouses', slug: 'blouses', parentId: createdCategories['tops'] },
    { name: 'Jeans', slug: 'jeans', parentId: createdCategories['bottoms'] },
    { name: 'Skirts', slug: 'skirts', parentId: createdCategories['bottoms'] },
    { name: 'Sneakers', slug: 'sneakers', parentId: createdCategories['shoes'] },
    { name: 'Heels', slug: 'heels', parentId: createdCategories['shoes'] },
  ];

  for (const sub of subCategories) {
    await prisma.category.upsert({
      where: { slug: sub.slug },
      update: {},
      create: sub,
    });
  }

  // Products
  const products = [
    {
      name: 'Classic White T-Shirt',
      slug: 'classic-white-tshirt',
      description: 'A timeless white crew-neck t-shirt made from 100% organic cotton. Soft, breathable, and perfect for any occasion.',
      price: 29.99,
      comparePrice: 39.99,
      categoryId: createdCategories['tops'],
      tags: ['cotton', 'casual', 'basic'],
      featured: true,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'],
      variants: [
        { size: 'XS', color: 'White', stock: 20, sku: 'CWT-XS-W' },
        { size: 'S', color: 'White', stock: 35, sku: 'CWT-S-W' },
        { size: 'M', color: 'White', stock: 40, sku: 'CWT-M-W' },
        { size: 'L', color: 'White', stock: 30, sku: 'CWT-L-W' },
        { size: 'XL', color: 'White', stock: 15, sku: 'CWT-XL-W' },
        { size: 'S', color: 'Black', stock: 25, sku: 'CWT-S-B' },
        { size: 'M', color: 'Black', stock: 30, sku: 'CWT-M-B' },
        { size: 'L', color: 'Black', stock: 20, sku: 'CWT-L-B' },
      ],
    },
    {
      name: 'Slim Fit Blue Jeans',
      slug: 'slim-fit-blue-jeans',
      description: 'Modern slim-fit jeans in a classic indigo wash. Stretch denim for all-day comfort.',
      price: 79.99,
      comparePrice: 99.99,
      categoryId: createdCategories['bottoms'],
      tags: ['denim', 'jeans', 'casual'],
      featured: true,
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'],
      variants: [
        { size: '28', color: 'Blue', stock: 15, sku: 'SBJ-28-B' },
        { size: '30', color: 'Blue', stock: 25, sku: 'SBJ-30-B' },
        { size: '32', color: 'Blue', stock: 30, sku: 'SBJ-32-B' },
        { size: '34', color: 'Blue', stock: 20, sku: 'SBJ-34-B' },
        { size: '36', color: 'Blue', stock: 10, sku: 'SBJ-36-B' },
        { size: '30', color: 'Black', stock: 18, sku: 'SBJ-30-BL' },
        { size: '32', color: 'Black', stock: 22, sku: 'SBJ-32-BL' },
      ],
    },
    {
      name: 'Floral Wrap Dress',
      slug: 'floral-wrap-dress',
      description: 'Elegant floral wrap dress in a lightweight chiffon fabric. Perfect for summer events.',
      price: 89.99,
      comparePrice: 119.99,
      categoryId: createdCategories['dresses'],
      tags: ['floral', 'summer', 'dress'],
      featured: true,
      images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600'],
      variants: [
        { size: 'XS', color: 'Floral Pink', stock: 8, sku: 'FWD-XS-FP' },
        { size: 'S', color: 'Floral Pink', stock: 15, sku: 'FWD-S-FP' },
        { size: 'M', color: 'Floral Pink', stock: 20, sku: 'FWD-M-FP' },
        { size: 'L', color: 'Floral Pink', stock: 12, sku: 'FWD-L-FP' },
        { size: 'S', color: 'Floral Blue', stock: 10, sku: 'FWD-S-FB' },
        { size: 'M', color: 'Floral Blue', stock: 15, sku: 'FWD-M-FB' },
      ],
    },
    {
      name: 'Wool Blend Coat',
      slug: 'wool-blend-coat',
      description: 'Sophisticated wool-blend coat with a tailored silhouette. Warm and stylish for cold seasons.',
      price: 249.99,
      comparePrice: 349.99,
      categoryId: createdCategories['outerwear'],
      tags: ['wool', 'coat', 'winter'],
      featured: true,
      images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600'],
      variants: [
        { size: 'S', color: 'Camel', stock: 5, sku: 'WBC-S-C' },
        { size: 'M', color: 'Camel', stock: 8, sku: 'WBC-M-C' },
        { size: 'L', color: 'Camel', stock: 6, sku: 'WBC-L-C' },
        { size: 'S', color: 'Black', stock: 7, sku: 'WBC-S-B' },
        { size: 'M', color: 'Black', stock: 10, sku: 'WBC-M-B' },
        { size: 'L', color: 'Black', stock: 8, sku: 'WBC-L-B' },
      ],
    },
    {
      name: 'White Sneakers',
      slug: 'white-sneakers',
      description: 'Clean, minimal white leather sneakers. Versatile and comfortable for everyday wear.',
      price: 119.99,
      comparePrice: null,
      categoryId: createdCategories['shoes'],
      tags: ['sneakers', 'casual', 'leather'],
      featured: true,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
      variants: [
        { size: '6', color: 'White', stock: 12, sku: 'WS-6-W' },
        { size: '7', color: 'White', stock: 18, sku: 'WS-7-W' },
        { size: '8', color: 'White', stock: 22, sku: 'WS-8-W' },
        { size: '9', color: 'White', stock: 20, sku: 'WS-9-W' },
        { size: '10', color: 'White', stock: 15, sku: 'WS-10-W' },
        { size: '11', color: 'White', stock: 8, sku: 'WS-11-W' },
      ],
    },
    {
      name: 'Leather Tote Bag',
      slug: 'leather-tote-bag',
      description: 'Genuine leather tote bag with spacious interior and stylish gold hardware.',
      price: 189.99,
      comparePrice: 229.99,
      categoryId: createdCategories['accessories'],
      tags: ['bag', 'leather', 'tote'],
      featured: false,
      images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600'],
      variants: [
        { size: 'One Size', color: 'Tan', stock: 10, sku: 'LTB-OS-T' },
        { size: 'One Size', color: 'Black', stock: 12, sku: 'LTB-OS-B' },
        { size: 'One Size', color: 'Navy', stock: 7, sku: 'LTB-OS-N' },
      ],
    },
    {
      name: 'Striped Linen Blouse',
      slug: 'striped-linen-blouse',
      description: 'Lightweight striped linen blouse with relaxed fit. Ideal for warm weather.',
      price: 59.99,
      comparePrice: 79.99,
      categoryId: createdCategories['tops'],
      tags: ['linen', 'summer', 'blouse'],
      featured: false,
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4c3f?w=600'],
      variants: [
        { size: 'XS', color: 'Navy Stripe', stock: 10, sku: 'SLB-XS-NS' },
        { size: 'S', color: 'Navy Stripe', stock: 18, sku: 'SLB-S-NS' },
        { size: 'M', color: 'Navy Stripe', stock: 20, sku: 'SLB-M-NS' },
        { size: 'L', color: 'Navy Stripe', stock: 14, sku: 'SLB-L-NS' },
      ],
    },
    {
      name: 'High-Waist Maxi Skirt',
      slug: 'high-waist-maxi-skirt',
      description: 'Flowing high-waist maxi skirt in satin finish. Elegant and timeless.',
      price: 69.99,
      comparePrice: 89.99,
      categoryId: createdCategories['bottoms'],
      tags: ['skirt', 'elegant', 'maxi'],
      featured: false,
      images: ['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600'],
      variants: [
        { size: 'XS', color: 'Ivory', stock: 8, sku: 'HMS-XS-IV' },
        { size: 'S', color: 'Ivory', stock: 15, sku: 'HMS-S-IV' },
        { size: 'M', color: 'Ivory', stock: 18, sku: 'HMS-M-IV' },
        { size: 'L', color: 'Ivory', stock: 10, sku: 'HMS-L-IV' },
        { size: 'S', color: 'Black', stock: 12, sku: 'HMS-S-B' },
        { size: 'M', color: 'Black', stock: 16, sku: 'HMS-M-B' },
      ],
    },
    {
      name: 'Oversized Denim Jacket',
      slug: 'oversized-denim-jacket',
      description: 'Classic oversized denim jacket with a vintage wash. A wardrobe essential.',
      price: 129.99,
      comparePrice: 159.99,
      categoryId: createdCategories['outerwear'],
      tags: ['denim', 'jacket', 'casual'],
      featured: false,
      images: ['https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=600'],
      variants: [
        { size: 'S', color: 'Light Blue', stock: 12, sku: 'ODJ-S-LB' },
        { size: 'M', color: 'Light Blue', stock: 18, sku: 'ODJ-M-LB' },
        { size: 'L', color: 'Light Blue', stock: 15, sku: 'ODJ-L-LB' },
        { size: 'XL', color: 'Light Blue', stock: 10, sku: 'ODJ-XL-LB' },
      ],
    },
    {
      name: 'Block Heel Sandals',
      slug: 'block-heel-sandals',
      description: 'Comfortable block-heel sandals with adjustable ankle strap. Versatile for day or night.',
      price: 99.99,
      comparePrice: 129.99,
      categoryId: createdCategories['shoes'],
      tags: ['sandals', 'heels', 'summer'],
      featured: false,
      images: ['https://images.unsplash.com/photo-1586996292898-71f4036c4e07?w=600'],
      variants: [
        { size: '6', color: 'Nude', stock: 8, sku: 'BHS-6-N' },
        { size: '7', color: 'Nude', stock: 12, sku: 'BHS-7-N' },
        { size: '8', color: 'Nude', stock: 15, sku: 'BHS-8-N' },
        { size: '9', color: 'Nude', stock: 10, sku: 'BHS-9-N' },
        { size: '7', color: 'Black', stock: 10, sku: 'BHS-7-B' },
        { size: '8', color: 'Black', stock: 12, sku: 'BHS-8-B' },
      ],
    },
    {
      name: 'Silk Scarf',
      slug: 'silk-scarf',
      description: 'Luxurious 100% silk scarf with a vibrant abstract print. Style as a neck scarf or hair accessory.',
      price: 49.99,
      comparePrice: 65.99,
      categoryId: createdCategories['accessories'],
      tags: ['silk', 'scarf', 'luxury'],
      featured: false,
      images: ['https://images.unsplash.com/photo-1601924921557-45e6dea0a157?w=600'],
      variants: [
        { size: 'One Size', color: 'Multicolor', stock: 25, sku: 'SS-OS-MC' },
        { size: 'One Size', color: 'Blue', stock: 18, sku: 'SS-OS-B' },
        { size: 'One Size', color: 'Red', stock: 15, sku: 'SS-OS-R' },
      ],
    },
    {
      name: 'Little Black Dress',
      slug: 'little-black-dress',
      description: 'The ultimate wardrobe staple. Knee-length black dress with a flattering A-line silhouette.',
      price: 109.99,
      comparePrice: 139.99,
      categoryId: createdCategories['dresses'],
      tags: ['black', 'classic', 'evening'],
      featured: true,
      images: ['https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600'],
      variants: [
        { size: 'XS', color: 'Black', stock: 10, sku: 'LBD-XS-B' },
        { size: 'S', color: 'Black', stock: 18, sku: 'LBD-S-B' },
        { size: 'M', color: 'Black', stock: 22, sku: 'LBD-M-B' },
        { size: 'L', color: 'Black', stock: 15, sku: 'LBD-L-B' },
        { size: 'XL', color: 'Black', stock: 8, sku: 'LBD-XL-B' },
      ],
    },
  ];

  for (const product of products) {
    const { variants, ...productData } = product;
    const existing = await prisma.product.findUnique({ where: { slug: productData.slug } });
    if (!existing) {
      const created = await prisma.product.create({ data: productData });
      await prisma.productVariant.createMany({ data: variants.map(v => ({ ...v, productId: created.id })) });
    }
  }

  // Coupons
  const coupons = [
    { code: 'SAVE10', type: CouponType.PERCENT, value: 10, minOrder: 0, maxUses: 100 },
    { code: 'FLAT20', type: CouponType.FIXED, value: 20, minOrder: 100, maxUses: 50 },
    { code: 'WELCOME15', type: CouponType.PERCENT, value: 15, minOrder: 0, maxUses: 200 },
    { code: 'VIP50', type: CouponType.PERCENT, value: 50, minOrder: 200, maxUses: 20 },
    { code: 'SUMMER30', type: CouponType.FIXED, value: 30, minOrder: 150, maxUses: null },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    });
  }

  // Theme settings
  const themeSettings = [
    { key: 'primary-color', value: '#C9A84C' },
    { key: 'secondary-color', value: '#1A1A2E' },
    { key: 'background-color', value: '#FAFAF8' },
    { key: 'text-color', value: '#1A1A1A' },
    { key: 'accent-color', value: '#E8D5A3' },
    { key: 'heading-font', value: 'Playfair Display' },
    { key: 'body-font', value: 'Inter' },
    { key: 'logo-text', value: 'FashionHub' },
    { key: 'tagline', value: 'Dress to Impress' },
  ];

  for (const setting of themeSettings) {
    await prisma.themeSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  // Home sections
  await prisma.homeSection.deleteMany();
  const homeSections = [
    {
      type: 'hero',
      title: 'New Season Arrivals',
      subtitle: 'Discover the latest trends in fashion. Shop our curated collection.',
      content: null,
      imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400',
      buttonText: 'Shop Now',
      buttonLink: '/products',
      order: 1,
      visible: true,
    },
    {
      type: 'featured',
      title: 'Featured Products',
      subtitle: 'Hand-picked favorites just for you',
      content: null,
      imageUrl: null,
      buttonText: 'View All',
      buttonLink: '/products',
      order: 2,
      visible: true,
    },
    {
      type: 'categories',
      title: 'Shop by Category',
      subtitle: 'Find exactly what you\'re looking for',
      content: null,
      imageUrl: null,
      buttonText: null,
      buttonLink: null,
      order: 3,
      visible: true,
    },
    {
      type: 'promo',
      title: 'Summer Sale is Here',
      subtitle: 'Up to 40% off on selected items. Limited time offer.',
      content: { backgroundColor: '#1A1A2E' },
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
      buttonText: 'Shop Sale',
      buttonLink: '/products?sale=true',
      order: 4,
      visible: true,
    },
    {
      type: 'newsletter',
      title: 'Stay in the Loop',
      subtitle: 'Subscribe to our newsletter for exclusive deals and style tips.',
      content: { placeholder: 'Enter your email address' },
      imageUrl: null,
      buttonText: 'Subscribe',
      buttonLink: null,
      order: 5,
      visible: true,
    },
  ];

  for (const section of homeSections) {
    await prisma.homeSection.create({ data: section });
  }

  console.log('Seeding complete!');
  console.log('Admin: admin@fashion.com / admin123');
  console.log('User: user@example.com / user123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
