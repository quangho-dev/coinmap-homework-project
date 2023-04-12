import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { PrismaModule } from 'prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [AuthService, JwtService],
})
export class AppModule {}
