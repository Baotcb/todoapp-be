import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }
    async createUser(userName: string, email: string, password: string) {
        const passwordHash = await bcrypt.hash(password, 12);
        return this.prisma.users.create({
            data: {
                username: userName,
                email: email,
                password_hash: passwordHash,
            },
            select: {
                id: true,
                username: true,
                email: true,
            },
        });
    }
    async findUserByEmail(email: string) {
        return this.prisma.users.findUnique({
            where: {
                email: email,
            },
        });
    }
    async findUserByUsername(username: string) {
        return this.prisma.users.findUnique({
            where: {
                username: username,
            },
        });
    }
    async validateUser(email: string, password: string) {
        const user = await this.findUserByEmail(email);
        if (user && (await bcrypt.compare(password, user.password_hash))) {
            const { password_hash, ...safeUser } = user;
            return safeUser;
        }
        return false;
    }
}
