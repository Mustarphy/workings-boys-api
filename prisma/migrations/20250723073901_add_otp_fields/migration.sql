-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpires" TIMESTAMP(3),
ADD COLUMN     "otpVerified" BOOLEAN NOT NULL DEFAULT false;
