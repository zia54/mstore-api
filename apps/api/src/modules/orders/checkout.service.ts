import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(input: any) {
    if (!input.items?.length) throw new BadRequestException('Cart is empty');
    const sortedItems = [...input.items].sort((a, b) => a.offerId.localeCompare(b.offerId));

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
      if (existing) return existing;

      const offerDetails: any[] = [];
      for (const item of sortedItems) {
        const updated = await tx.$executeRaw`
          UPDATE "SellerOffer"
          SET "availableQty" = "availableQty" - ${item.quantity},
              "reservedQty"  = "reservedQty" + ${item.quantity}
          WHERE "id" = ${item.offerId} AND "isActive" = 1 AND "availableQty" >= ${item.quantity}
        `;
        if (updated === 0) throw new ConflictException(`Insufficient stock for ${item.offerId}`);
        const offer = await tx.sellerOffer.findUniqueOrThrow({
          where: { id: item.offerId },
          include: { seller: true, variant: { include: { product: true } } },
        });
        offerDetails.push({ offer, quantity: item.quantity });
      }

      const sellerGroups = new Map<string, any[]>();
      let subtotalMinor = 0;
      for (const entry of offerDetails) {
        subtotalMinor += entry.offer.priceMinor * entry.quantity;
        const list = sellerGroups.get(entry.offer.sellerId) ?? [];
        list.push(entry);
        sellerGroups.set(entry.offer.sellerId, list);
      }

      const shippingMinor = input.currency === 'PKR' ? 25000 : 1000;
      const taxMinor = Math.round((subtotalMinor * 1600) / 10000);
      const grandTotalMinor = subtotalMinor + shippingMinor + taxMinor;
      const orderNumber = `MS-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;

      return tx.order.create({
        data: {
          orderNumber,
          customerId: input.customerId,
          currency: input.currency || 'PKR',
          subtotalMinor,
          shippingMinor,
          taxMinor,
          grandTotalMinor,
          paymentMethod: input.paymentMethod,
          shippingAddress: JSON.stringify(input.shippingAddress),
          idempotencyKey: input.idempotencyKey,
          subOrders: {
            create: Array.from(sellerGroups.entries()).map(([sellerId, entries], idx) => {
              const sellerSubtotal = entries.reduce((acc, e) => acc + e.offer.priceMinor * e.quantity, 0);
              const commissionMinor = Math.round((sellerSubtotal * entries[0].offer.seller.commissionRateBps) / 10000);
              return {
                sellerId,
                subOrderNumber: `${orderNumber}-S${idx + 1}`,
                subtotalMinor: sellerSubtotal,
                commissionMinor,
                sellerNetMinor: sellerSubtotal - commissionMinor,
                items: {
                  create: entries.map((e) => ({
                    offerId: e.offer.id,
                    titleSnapshot: e.offer.variant.product.title,
                    quantity: e.quantity,
                    unitPriceMinor: e.offer.priceMinor,
                    totalPriceMinor: e.offer.priceMinor * e.quantity,
                  })),
                },
              };
            }),
          },
        },
        include: { subOrders: { include: { items: true } } },
      });
    });
  }
}
