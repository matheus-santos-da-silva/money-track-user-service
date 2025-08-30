import { User } from "src/domain/entities/user";
import { UpdateUserDTO } from "src/domain/DTO/update-user-DTO";
import { PrismaService } from "../config/prisma.service";
import { FindUserResponseDTO } from "src/domain/DTO/find-user-response-DTO";
import { CreateUserResponseDTO } from "src/domain/DTO/create-user-response-DTO";
import { findByEmailResponseDTO } from "src/domain/DTO/find-by-email-response-DTO";
import { UsersRepositoryProtocol } from "./protocols/users-repository-protocol";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

@Injectable()
export class UsersRepository implements UsersRepositoryProtocol {
  constructor(private readonly prisma: PrismaService) {}

  async findPasswordById(id: string): Promise<{ password: string }> {
    try {
      const userPassword = await this.prisma.user.findFirst({
        where: { id },
        select: { password: true },
      });

      return userPassword;
    } catch (error) {
      throw new NotFoundException(
        "Erro ao tentar encontrar o usuário, tente novamente!"
      );
    }
  }

  async update(id: string, data: UpdateUserDTO) {
    try {
      await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException("Erro ao atualizar o usuário!");
    }
  }

  async findById(id: string): Promise<FindUserResponseDTO> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id },
        select: { id: true, name: true, email: true },
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
