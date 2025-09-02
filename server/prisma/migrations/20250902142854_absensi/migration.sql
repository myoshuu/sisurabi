/*
  Warnings:

  - Added the required column `catatan` to the `Absensi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Absensi` ADD COLUMN `catatan` VARCHAR(191) NOT NULL;
