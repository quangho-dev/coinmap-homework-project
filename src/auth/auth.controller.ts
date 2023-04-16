import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  Response,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Response as Res } from 'express';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  signin(@Request() req, @Response() res, @Body() dto: AuthDto) {
    return this.authService.signin(dto, req, res);
  }

  @Get('/confirm/:id')
  async confirmEmail(@Param('id') id: string, @Response() res: Res) {
    return this.authService.confirmEmail(id, res);
  }
}
