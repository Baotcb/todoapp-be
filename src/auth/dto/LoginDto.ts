import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john@example.com', description: 'Email đăng ký' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mật khẩu' })
  password: string;
}
