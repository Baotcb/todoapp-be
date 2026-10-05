import { BadRequestException, Body, Controller, Get, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { randomBytes } from 'crypto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/LoginDto';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.username,
      registerDto.email,
      registerDto.password,
    );
  }
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }



  @Get('mezon')
  loginWithMezon(@Res() response: Response) {
    const state = randomBytes(16).toString('hex').slice(0, 11);

    const params = new URLSearchParams({
      client_id: this.configService.get<string>('MEZON_CLIENT_ID')!,
      redirect_uri: this.configService.get<string>('MEZON_REDIRECT_URI')!,
      response_type: 'code',
      scope: 'openid offline',
      state,
    });
    const url =
      `https://oauth2.mezon.ai/oauth2/auth?${params.toString()}`;

    response.cookie('mezon_oauth_state', state,
      {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 5 * 60 * 1000,
      },
    );

    return response.redirect(url);
  }


  @Get('mezon/callback')
  async mezonCallBack(@Query('code') code: string, @Query('state') state: string, @Res() response: Response, @Req() request: any,) {
    console.log('MEZON CALLBACK');
    console.log('code:', code);
    console.log('state:', state);
    if (!code) {
      throw new BadRequestException(
        'Missing authorization code',
      );
    }
    const savedState =
      request.cookies?.mezon_oauth_state;

    if (state !== savedState) {
      throw new UnauthorizedException(
        'Invalid OAuth state',
      );
    }
    const tokenData = await this.authService.exchangeMezonCode(code, state);
    const result = await this.authService.loginWithMezon(tokenData.id_token);

    return response.redirect(`http://localhost:3001/login/mezon-callback?token=${encodeURIComponent(result.access_token)}`,);
  }

}
