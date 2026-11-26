import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FulfillmentService {
  constructor(private readonly prisma: PrismaService) {}

  async getSellerSubOrders(sellerId?: string) {
    return this.prisma.subOrder.findMany({
      where: sellerId ? { sellerId } : {},
      include: {
        order: { include: { customer: { select: { fullName: true, email: true } } } },
        seller: true,
        items: true,
      },
      orderBy: { order: { createdAt: 'desc' } },
    });
  }

  async updateSubOrderStatus(subOrderId: string, status: string, trackingNumber?: string) {
    const allowed = ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!allowed.includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    return this.prisma.$transaction(async (tx) => {
      const subOrder = await tx.subOrder.findUnique({
        where: { id: subOrderId },
        include: { order: true, seller: true, items: true },
      });
      if (!subOrder) throw new NotFoundException('Sub-order not found');

      const updated = await tx.subOrder.update({
        where: { id: subOrderId },
        data: {
          status,
          trackingNumber: trackingNumber || subOrder.trackingNumber,
        },
        include: { order: true, seller: true, items: true },
      });

      // When order is DELIVERED, post Double-Entry Accounting Ledger entries
      if (status === 'DELIVERED' && subOrder.status !== 'DELIVERED') {
        const cashAccount = await tx.ledgerAccount.upsert({
          where: { code: '1001-PLATFORM-ESCROW' },
          update: {},
          create: {
            code: '1001-PLATFORM-ESCROW',
            name: 'Platform Escrow Cash (PKR)',
            type: 'ASSET',
            currency: 'PKR',
          },
        });

        const revenueAccount = await tx.ledgerAccount.upsert({
          where: { code: '4001-COMMISSION-REV' },
          update: {},
          create: {
            code: '4001-COMMISSION-REV',
            name: 'M Store Marketplace Commission Revenue',
            type: 'REVENUE',
            currency: 'PKR',
          },
        });

        const sellerPayableAccount = await tx.ledgerAccount.upsert({
          where: { code: `2001-SELLER-${subOrder.sellerId.slice(0, 8)}` },
          update: {},
          create: {
            code: `2001-SELLER-${subOrder.sellerId.slice(0, 8)}`,
            name: `Seller Payable - ${subOrder.seller.storeName}`,
            type: 'LIABILITY',
            currency: 'PKR',
            ownerId: subOrder.sellerId,
          },
        });

        await tx.ledgerTransaction.upsert({
          where: { idempotencyKey: `SETTLE-${subOrder.id}` },
          update: {},
          create: {
            referenceType: 'SUB_ORDER_DELIVERY',
            referenceId: subOrder.id,
            description: `Settlement for ${subOrder.subOrderNumber} (${subOrder.seller.storeName})`,
            idempotencyKey: `SETTLE-${subOrder.id}`,
            entries: {
              create: [
                {
                  accountId: cashAccount.id,
                  currency: 'PKR',
                  debitMinor: subOrder.subtotalMinor,
                  creditMinor: 0,
                },
                {
                  accountId: revenueAccount.id,
                  currency: 'PKR',
                  debitMinor: 0,
                  creditMinor: subOrder.commissionMinor,
                },
                {
                  accountId: sellerPayableAccount.id,
                  currency: 'PKR',
                  debitMinor: 0,
                  creditMinor: subOrder.sellerNetMinor,
                },
              ],
            },
          },
        });

        await tx.order.update({
          where: { id: subOrder.orderId },
          data: { status: 'DELIVERED' },
        });
      }

      return updated;
    });
  }

  async trackOrderByNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber: orderNumber.trim().toUpperCase() },
      include: {
        customer: { select: { fullName: true } },
        subOrders: {
          include: {
            seller: { select: { storeName: true } },
            items: true,
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Order number not found');
    return order;
  }

  async getAccountingLedger() {
    const accounts = await this.prisma.ledgerAccount.findMany({
      include: { entries: true },
    });
    const transactions = await this.prisma.ledgerTransaction.findMany({
      include: { entries: { include: { account: true } } },
      orderBy: { postedAt: 'desc' },
    });
    return { accounts, transactions };
  }
}
