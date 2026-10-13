import { Prisma } from "@prisma/client";
import { User } from "src/domain/entities/user";
import { UpdateUserDTO } from "src/domain/DTO/update-user-DTO";
import { PrismaService } from "../config/prisma.service";
import { FindUserResponseDTO } from "src/domain/DTO/find-user-response-DTO";
import { CreateUserResponseDTO } from "src/domain/DTO/create-user-response-DTO";
import { UpdateSubscriptionDTO } from "src/domain/DTO/update-subscription-DTO";
import { findByEmailResponseDTO } from "src/domain/DTO/find-by-email-response-DTO";
import { UsersRepositoryProtocol } from "./protocols/users-repository-protocol";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

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
        "Erro ao tentar encontrar o usuário, tente novamente!",
      );
    }
  }

  async update(id: string, data: UpdateUserDTO & { password?: string }) {
    try {
      await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("E-mail já está em uso.");
      }
      throw new BadRequestException("Erro ao atualizar o usuário!");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException("Erro ao excluir o usuário!");
    }
  }

  async findById(id: string): Promise<FindUserResponseDTO> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          plan: true,
          trialEndsAt: true,
        },
      });
      return user;
    } catch (error) {
      throw new NotFoundException(
        "Erro ao tentar encontrar o usuário, tente novamente!",
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
        "Erro ao tentar encontrar o usuário, tente novamente!",
      );
    }
  }

  async findByPurchaseToken(token: string): Promise<{ id: string } | null> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { subscriptionPurchaseToken: token },
        select: { id: true },
      });
      return user;
    } catch (error) {
      throw new NotFoundException(
        "Erro ao tentar encontrar o usuário, tente novamente!",
      );
    }
  }

  async updateSubscription(
    id: string,
    data: UpdateSubscriptionDTO,
  ): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException("Erro ao atualizar assinatura do usuário!");
    }
  }

  async create({
    email,
    name,
    password,
    plan,
    trialStartedAt,
    trialEndsAt,
  }: User): Promise<CreateUserResponseDTO> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          name,
          password,
          plan,
          trialStartedAt,
          trialEndsAt,
        },
        select: { id: true },
      });

      return user;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("Usuário já cadastrado. Acesse sua conta!");
      }
      throw new BadRequestException(
        "Erro ao criar o usuário, tente novamente!",
      );
    }
  }
}
