import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'bao@gmail.com', description: 'Email đăng ký' })
  email: string;

  @ApiProperty({ example: '123', description: 'Mật khẩu' })
  password: string;
}
