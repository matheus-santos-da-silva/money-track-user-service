import { User } from "src/domain/entities/user";
import { PrismaService } from "../config/prisma.service";
import { UsersRepositoryProtocol } from "./protocols/users-repository-protocol";
import { FindUserResponseDTO } from "src/domain/DTO/find-user-response-DTO";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateUserResponseDTO } from "src/domain/DTO/create-user-response-DTO";
import { findByEmailResponseDTO } from "src/domain/DTO/find-by-email-response-DTO";

@Injectable()
export class UsersRepository implements UsersRepositoryProtocol {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<FindUserResponseDTO> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id },
        select: { id: true, name: true },
      });
      return user;
    } catch (error) {
      throw new NotFoundException(
        "Erro ao tentar encontrar o usuário, tente novamente!"
      );
    }
  }

  async findByEmail(email: string): Promise<findByEmailResponseDTO> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email },
        select: { id: true, password: true },
      });
      return user;
    } catch (error) {
      throw new NotFoundException(
        "Erro ao tentar encontrar o usuário, tente novamente!"
      );
    }
  }

  async create({
    email,
    name,
    password,
    plan,
  }: User): Promise<CreateUserResponseDTO> {
    try {
      const user = await this.prisma.user.create({
        data: { email, name, password, plan },
        select: { id: true },
      });

      return user;
    } catch (error) {
      throw new BadRequestException(
        "Erro ao criar o usuário, tente novamente!"
      );
    }
  }
}
