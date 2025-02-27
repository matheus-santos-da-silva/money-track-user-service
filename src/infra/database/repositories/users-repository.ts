import { User } from "src/domain/entities/user";
import { PrismaService } from "../config/prisma.service";
import { UsersRepositoryProtocol } from "./protocols/users-repository-protocol";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

@Injectable()
export class UsersRepository implements UsersRepositoryProtocol {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.prisma.user.findFirst({ where: { email } });
      return user;
    } catch (error) {
      throw new NotFoundException(
        "Erro ao tentar encontrar o usuário, tente novamente!"
      );
    }
  }

  async create({ email, name, password, plan }: User): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: { email, name, password, plan },
      });

      return user;
    } catch (error) {
      throw new BadRequestException(
        "Erro ao criar o usuário, tente novamente!"
      );
    }
  }
}
