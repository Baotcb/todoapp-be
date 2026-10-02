import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'johndoe', description: 'Tên đăng nhập' })
  username: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email đăng ký' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mật khẩu' })
  password: string;
}
