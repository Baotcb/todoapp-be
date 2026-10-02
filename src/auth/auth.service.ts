import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

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
    const existEmail = this.userService.findUserByEmail(email);
    if (!existEmail) {
      throw new ConflictException('Email not found');
    }
    const user = await this.userService.validateUser(email, password);
    if (user) {
      const payload = {
        user,
      };
      const token = this.jwtService.sign(payload);
      return {
        token,
      };
    }
    throw new ConflictException('Invalid email or password');
  }
}
