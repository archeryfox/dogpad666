/*
  Warnings:

  - Added the required column `userId` to the `Speaker` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Speaker" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "biography" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Speaker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Speaker" ("biography", "id", "name") SELECT "biography", "id", "name" FROM "Speaker";
DROP TABLE "Speaker";
ALTER TABLE "new_Speaker" RENAME TO "Speaker";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
