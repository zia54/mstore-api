import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';
import { AuthService } from './modules/auth/auth.service';
import { AuthController } from './modules/auth/auth.controller';
import { CatalogController } from './modules/catalog/catalog.controller';
import { CheckoutService } from './modules/orders/checkout.service';
import { CheckoutController } from './modules/orders/checkout.controller';
import { FulfillmentService } from './modules/fulfillment/fulfillment.service';
import { FulfillmentController } from './modules/fulfillment/fulfillment.controller';
import { PaymentsService } from './modules/payments/payments.service';
import { PaymentsController } from './modules/payments/payments.controller';
import { AffiliateService } from './modules/affiliate/affiliate.service';
import { AffiliateController } from './modules/affiliate/affiliate.controller';
import { GovernanceService } from './modules/governance/governance.service';
import { GovernanceController } from './modules/governance/governance.controller';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET || 'mstore_dev_secret_2026',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [
    AuthController,
    CatalogController,
    CheckoutController,
    FulfillmentController,
    PaymentsController,
    AffiliateController,
    GovernanceController,
  ],
  providers: [
    PrismaService,
    AuthService,
    CheckoutService,
    FulfillmentService,
    PaymentsService,
    AffiliateService,
    GovernanceService,
  ],
})
export class AppModule {}
