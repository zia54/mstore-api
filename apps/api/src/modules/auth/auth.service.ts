import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  async register(dto: { email: string; password: string; fullName: string; role?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email is already registered');
    const passwordHash = await argon2.hash(dto.password);
    const allowedRoles = ['CUSTOMER', 'SELLER', 'AFFILIATE', 'B2B_BUYER'];
    const role = dto.role && allowedRoles.includes(dto.role) ? dto.role : 'CUSTOMER';
    const user = await this.prisma.user.create({
      data: { email: dto.email.toLowerCase(), passwordHash, fullName: dto.fullName, role },
    });
    const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email, role: user.role });
    return { accessToken, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName } };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) throw new UnauthorizedException('Invalid email or password');
    const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email, role: user.role });
    return { accessToken, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName } };
  }
}
