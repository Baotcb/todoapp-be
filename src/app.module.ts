import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TodoModule } from './todo/todo.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { RedisModule } from './redis/redis.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    RedisModule,
    AuthModule,
    TodoModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
