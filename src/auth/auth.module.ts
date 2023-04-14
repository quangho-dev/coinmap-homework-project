import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    JwtModule,
    PassportModule,
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: {
          host: process.env.MAIL_HOST,
          secure: false,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          },
        },
        defaults: {
          from: `"No Reply" <${process.env.MAIL_FROM}>`,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
