import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }

  async register(userName: string, email: string, password: string) {
    const existingEmail = await this.userService.findUserByEmail(email);

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingUsername =
      await this.userService.findUserByUsername(userName);

    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    return this.userService.createUser(userName, email, password);
  }

  async login(email: string, password: string) {
    const existEmail = await this.userService.findUserByEmail(email);
    if (!existEmail) {
      throw new ConflictException('Email not found');
    }
    const user = await this.userService.validateUser(email, password);
    if (user) {
      const payload = {
        sub: user.id.toString(),
        email: user.email,
        username: user.username,
        user,
      };
      const token = this.jwtService.sign(payload);
      return {
        token,
      };
    }
    throw new ConflictException('Invalid email or password');
  }
  async loginWithMezon(idToken: string) {
    const payload =
      await this.verifyMezonIdToken(idToken);

    const mezonId = payload.mezon_id;

    if (typeof mezonId !== 'string') {
      throw new UnauthorizedException(
        'Invalid Mezon ID',
      );
    }

    const username = payload.username;

    const email = payload.email;

    if (
      typeof username !== 'string' ||
      typeof email !== 'string'
    ) {
      throw new UnauthorizedException(
        'Missing Mezon user information',
      );
    }

    let user =
      await this.userService.findByMezonId(
        mezonId,
      );

    if (!user) {
      const existingEmail =
        await this.userService.findUserByEmail(
          email,
        );

      if (existingEmail) {

        user = await this.userService.linkMezonId(
          existingEmail.id,
          mezonId,
        );
      } else {

        user = await this.userService.createMezonUser(
          mezonId,
          username,
          email,
        );
      }
    }

    const accessToken =
      await this.jwtService.signAsync({
        sub: user.id.toString(),
        email: user.email,
        username: user.username,
      });

    return {
      access_token: accessToken,
    };
  }





  async exchangeMezonCode(code: string, state: string) {
    const clientId = this.configService.get<string>('MEZON_CLIENT_ID');
    const clientSecret = this.configService.get<string>('MEZON_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('MEZON_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Missing OAuth configuration");
    }
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      state,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: redirectUri!,
    });

    const response = await fetch(
      'https://oauth2.mezon.ai/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      },
    );
    const data = await response.json();

    if (!response.ok) {
      console.error(
        'Mezon token error:',
        data,
      );

      throw new BadRequestException(
        'Failed to exchange Mezon authorization code',
      );
    }

    return data;
  }
  async verifyMezonIdToken(idToken: string) {
    const clientId =
      this.configService.get<string>('MEZON_CLIENT_ID');

    const JWKS = createRemoteJWKSet(
      new URL(
        'https://oauth2.mezon.ai/.well-known/jwks.json',
      ),
    );

    const { payload } = await jwtVerify(
      idToken,
      JWKS,
      {
        issuer: 'https://oauth2.mezon.ai',
        audience: clientId,
      },
    );

    return payload;
  }



}
