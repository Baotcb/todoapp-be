import { BadRequestException, Body, Controller, Get, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { randomBytes } from 'crypto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/LoginDto';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) { }

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
  async loginWithMezon(@Res() response: Response) {
    const state = randomBytes(16).toString('hex').slice(0, 11);

    await this.redisService.set(`mezon_oauth_state:${state}`, 'true', 5 * 60);

    const params = new URLSearchParams({
      client_id: this.configService.get<string>('MEZON_CLIENT_ID')!,
      redirect_uri: this.configService.get<string>('MEZON_REDIRECT_URI')!,
      response_type: 'code',
      scope: 'openid offline',
      state,
    });
    const mezonOauthUrl = this.configService.get<string>('MezonOauthUrl');
    const url = `${mezonOauthUrl}/oauth2/auth?${params.toString()}`;

    return response.redirect(url);
  }

  @Get('mezon/callback')
  async mezonCallBack(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() response: Response,
  ) {
    console.log('MEZON CALLBACK');
    console.log('code:', code);
    console.log('state:', state);
    if (!code) {
      throw new BadRequestException(
        'Missing authorization code',
      );
    }
    if (!state) {
      throw new BadRequestException(
        'Missing OAuth state',
      );
    }

    const stateKey = `mezon_oauth_state:${state}`;
    const savedState = await this.redisService.get(stateKey);

    if (!savedState) {
      throw new UnauthorizedException(
        'Invalid or expired OAuth state',
      );
    }

    await this.redisService.del(stateKey);

    const tokenData = await this.authService.exchangeMezonCode(code, state);
    const result = await this.authService.loginWithMezon(tokenData.id_token);

    const clientUrl = this.configService.get<string>('ClientSettingsUrl');
    return response.redirect(
      `${clientUrl}/login/mezon-callback?token=${encodeURIComponent(result.access_token)}`,
    );
  }
}
