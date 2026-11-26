import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GovernanceService {
  constructor(private readonly prisma: PrismaService) {}

  async listSellers() {
    return this.prisma.sellerProfile.findMany({
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveSeller(sellerId: string, kycStatus: 'APPROVED' | 'REJECTED') {
    const seller = await this.prisma.sellerProfile.update({
      where: { id: sellerId },
      data: { kycStatus },
    });

    await this.prisma.auditLog.create({
      data: {
        actorRole: 'SUPER_ADMIN',
        action: `SELLER_KYC_${kycStatus}`,
        targetType: 'SELLER_PROFILE',
        targetId: sellerId,
        metadata: JSON.stringify({ storeName: seller.storeName, kycStatus }),
      },
    });

    return seller;
  }

  async addProductReview(productId: string, customerName: string, rating: number, comment: string) {
    if (rating < 1 || rating > 5) throw new BadRequestException('Rating must be between 1 and 5');
    return this.prisma.auditLog.create({
      data: {
        actorRole: 'CUSTOMER',
        action: 'PRODUCT_REVIEW',
        targetType: 'PRODUCT',
        targetId: productId,
        metadata: JSON.stringify({ customerName, rating, comment, createdAt: new Date().toISOString() }),
      },
    });
  }

  async getProductReviews(productId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: { action: 'PRODUCT_REVIEW', targetType: 'PRODUCT', targetId: productId },
      orderBy: { createdAt: 'desc' },
    });
    return logs.map((l) => ({ id: l.id, ...JSON.parse(l.metadata) }));
  }
}
