import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('MStore@2026');

  await prisma.user.upsert({
    where: { email: 'admin@mstore.pk' },
    update: {},
    create: {
      email: 'admin@mstore.pk',
      fullName: 'M Store Super Admin',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@mstore.pk' },
    update: {},
    create: {
      email: 'seller@mstore.pk',
      fullName: 'Aurelia Flagship Store',
      passwordHash,
      role: 'SELLER',
    },
  });

  const seller = await prisma.sellerProfile.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      userId: sellerUser.id,
      storeName: 'Aurelia Official Flagship',
      storeSlug: 'aurelia-official',
      legalBusinessName: 'Aurelia Electronics (Pvt) Ltd',
      ntnOrTaxId: '4192837-5',
      kycStatus: 'APPROVED',
      commissionRateBps: 800,
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@mstore.pk' },
    update: {},
    create: {
      email: 'customer@mstore.pk',
      fullName: 'Ali Raza',
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: { name: 'Electronics & Audio', slug: 'electronics' },
  });

  await prisma.product.upsert({
    where: { slug: 'm-pro-anc-headphones' },
    update: {},
    create: {
      categoryId: category.id,
      title: 'M-Pro Flagship ANC Wireless Headphones (Studio Edition)',
      slug: 'm-pro-anc-headphones',
      brand: 'Aurelia Audio',
      description: 'Active Noise Cancelling studio wireless headphones with 45-hour battery life.',
      imageUrl: 'https://placehold.co/600x400/0f172a/f59e0b?text=M-Pro+Headphones',
      isApproved: true,
      variants: {
        create: {
          sku: 'AUR-MPRO-BLK-01',
          optionValues: JSON.stringify({ color: 'Obsidian Black' }),
          offers: {
            create: {
              sellerId: seller.id,
              currency: 'PKR',
              priceMinor: 2450000,
              availableQty: 50,
            },
          },
        },
      },
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
