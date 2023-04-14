import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { CONFIRM_EMAIL_PREFIX, jwtSecret } from 'src/utils/constants';
import { sendConfirmUserEmail } from 'src/utils/sendConfirmUserEmail';
import { confirmEmailLink } from 'src/utils/confirmEmailLink';
import { redis } from 'src/redis';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async signup(dto: AuthDto) {
    const { email, password } = dto;

    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        hashedPassword,
      },
    });

    await sendConfirmUserEmail(email, await confirmEmailLink(user.id));

    return { message: 'User created succefully' };
  }

  async hashPassword(password: string) {
    const saltOrRounds = 10;

    return await bcrypt.hash(password, saltOrRounds);
  }

  async comparePasswords(args: { hash: string; password: string }) {
    return await bcrypt.compare(args.password, args.hash);
  }

  async signin(dto: AuthDto, req: Request, res: Response) {
    const { email, password } = dto;

    const foundUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!foundUser) {
      throw new BadRequestException('Wrong credentials');
    }

    if (!foundUser.isEmailConfirmed) {
      throw new BadRequestException('Your account has not been activated.');
    }

    const compareSuccess = await this.comparePasswords({
      password,
      hash: foundUser.hashedPassword,
    });

    if (!compareSuccess) {
      throw new BadRequestException('Wrong credentials');
    }

    const token = await this.signToken({
      userId: foundUser.id,
      email: foundUser.email,
    });

    if (!token) {
      throw new ForbiddenException('Could not signin');
    }

    res.cookie('token', token, {});

    return res.send({ message: 'Logged in succefully' });
  }

  async signToken(args: { userId: string; email: string }) {
    const payload = {
      id: args.userId,
      email: args.email,
    };

    const token = await this.jwt.signAsync(payload, {
      secret: jwtSecret,
    });

    return token;
  }

  async confirmEmail(id: string, res: Response) {
    const userId = await redis.get(`${CONFIRM_EMAIL_PREFIX}${id}`);

    if (!userId) {
      throw new NotFoundException();
    }
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isEmailConfirmed: true,
      },
    });

    res.send('Confirm user successfully.');
  }
}
