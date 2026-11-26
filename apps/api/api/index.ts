import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

let cachedApp: any;
export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api/v1');
    app.enableCors();
    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp(req, res);
}