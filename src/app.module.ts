import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TodoModule } from './todo/todo.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    AuthModule,
    TodoModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
  ],
})
export class AppModule {}
