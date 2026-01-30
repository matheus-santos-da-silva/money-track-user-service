/*
  Warnings:

  - Added the required column `trialEndsAt` to the `users` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `plan` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'TRIAL', 'PREMIUM');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "trialEndsAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "trialStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "plan",
ADD COLUMN     "plan" "Plan" NOT NULL;
