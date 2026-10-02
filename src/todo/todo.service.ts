import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) { }

  private parseBigInt(val: any, fieldName = 'id'): bigint {
    try {
      return BigInt(val);
    } catch {
      throw new BadRequestException(`Giá trị ${fieldName} không hợp lệ: ${val}`);
    }
  }

  async create(userId: string | number | bigint, createTodoDto: CreateTodoDto) {
    if (!userId) {
      throw new UnauthorizedException('Không tìm thấy thông tin người dùng từ token');
    }

    if (!createTodoDto?.title || !createTodoDto.title.trim()) {
      throw new BadRequestException('Tiêu đề công việc (title) là bắt buộc và không được để trống');
    }

    const userBigIntId = this.parseBigInt(userId, 'user_id');

    return this.prisma.todos.create({
      data: {
        title: createTodoDto.title.trim(),
        completed: createTodoDto.completed ?? false,
        user_id: userBigIntId,
      },
    });
  }

  async findAll(userId: string | number | bigint) {
    const userBigIntId = this.parseBigInt(userId, 'user_id');

    return this.prisma.todos.findMany({
      where: {
        user_id: userBigIntId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(
    id: string | number | bigint,
    userId: string | number | bigint,
  ) {
    const todoId = this.parseBigInt(id, 'id');
    const userBigIntId = this.parseBigInt(userId, 'user_id');

    const todo = await this.prisma.todos.findFirst({
      where: {
        id: todoId,
        user_id: userBigIntId,
      },
    });

    if (!todo) {
      throw new NotFoundException(`Không tìm thấy công việc với ID: ${id}`);
    }

    return todo;
  }

  async update(
    id: string | number | bigint,
    userId: string | number | bigint,
    updateTodoDto: UpdateTodoDto,
  ) {
    const todoId = this.parseBigInt(id, 'id');


    await this.findOne(id, userId);

    return this.prisma.todos.update({
      where: {
        id: todoId,
      },
      data: {
        ...(updateTodoDto.title !== undefined && {
          title: updateTodoDto.title,
        }),
        ...(updateTodoDto.completed !== undefined && {
          completed: updateTodoDto.completed,
        }),
        updated_at: new Date(),
      },
    });
  }

  async remove(
    id: string | number | bigint,
    userId: string | number | bigint,
  ) {
    const todoId = this.parseBigInt(id, 'id');

    await this.findOne(id, userId);

    await this.prisma.todos.delete({
      where: {
        id: todoId,
      },
    });

    return {
      message: `Đã xóa công việc với ID ${id} thành công`,
    };
  }
}
