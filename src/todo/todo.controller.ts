import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('todo')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('todo')
export class TodoController {
  private readonly logger = new Logger(TodoController.name);

  constructor(private readonly todoService: TodoService) { }

  private getUserId(req: any): string | number | bigint {
    return req.user?.id ?? req.user?.user?.id;
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Tạo công việc thành công' })
  create(@Req() req: any, @Body() createTodoDto: CreateTodoDto) {
    const userId = this.getUserId(req);
    this.logger.log(`[POST /todo] userId=${userId}, body=${JSON.stringify(createTodoDto)}, req.user=${JSON.stringify(req.user)}`);
    return this.todoService.create(userId, createTodoDto);
  }

  @Get()

  @ApiResponse({ status: 200, description: 'Danh sách công việc' })
  findAll(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.todoService.findAll(userId);
  }

  @Get('findall')

  findAllAlias(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.todoService.findAll(userId);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Chi tiết công việc' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công việc' })
  findOne(@Req() req: any, @Param('id') id: string) {
    const userId = this.getUserId(req);
    return this.todoService.findOne(id, userId);
  }

  @Patch(':id')

  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công việc' })
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    const userId = this.getUserId(req);
    return this.todoService.update(id, userId, updateTodoDto);
  }

  @Delete(':id')

  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công việc' })
  remove(@Req() req: any, @Param('id') id: string) {
    const userId = this.getUserId(req);
    return this.todoService.remove(id, userId);
  }
}
