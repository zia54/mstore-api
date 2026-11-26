import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AffiliateService {
  constructor(private readonly prisma: PrismaService) {}

  async registerAffiliate(email: string, referralCode: string) {
    const cleanCode = referralCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return { error: 'User email not found. Register on storefront first.' };

    const profile = await this.prisma.affiliateProfile.upsert({
      where: { userId: user.id },
      update: { referralCode: cleanCode, isApproved: true },
      create: {
        userId: user.id,
        referralCode: cleanCode,
        commissionBps: 300,
        isApproved: true,
      },
    });

    return { message: 'Affiliate Partner Activated!', profile };
  }

  async getStats(code: string) {
    const profile = await this.prisma.affiliateProfile.findUnique({
      where: { referralCode: code.trim().toUpperCase() },
      include: { user: { select: { fullName: true, email: true } }, orders: true },
    });
    if (!profile) return null;

    const totalSalesMinor = profile.orders.reduce((s, o) => s + o.subtotalMinor, 0);
    const earnedCommissionMinor = Math.round((totalSalesMinor * profile.commissionBps) / 10000);
    return { profile, totalOrders: profile.orders.length, totalSalesMinor, earnedCommissionMinor };
  }
}
