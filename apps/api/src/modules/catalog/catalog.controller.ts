import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('products')
  listProducts() {
    return this.prisma.product.findMany({
      where: { isApproved: true },
      include: {
        category: true,
        variants: {
          include: {
            offers: {
              where: { isActive: true },
              include: { seller: { select: { id: true, storeName: true, storeSlug: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('products/:slug')
  getProduct(@Param('slug') slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: { category: true, variants: { include: { offers: { include: { seller: true } } } } },
    });
  }

  @Post('products')
  createProduct(@Body() body: any) {
    return this.prisma.product.create({
      data: {
        categoryId: body.categoryId,
        title: body.title,
        slug: body.slug,
        brand: body.brand,
        description: body.description,
        imageUrl: body.imageUrl,
        isApproved: true,
        variants: {
          create: {
            sku: body.sku,
            optionValues: JSON.stringify({ edition: 'Standard' }),
            offers: {
              create: {
                sellerId: body.sellerId,
                currency: 'PKR',
                priceMinor: Math.round(body.pricePkr * 100),
                availableQty: body.stockQty,
              },
            },
          },
        },
      },
    });
  }
}
