-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other', 'Unknown');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "display_name" VARCHAR(30),
    "bio" VARCHAR(200),
    "gender" "Gender" NOT NULL DEFAULT 'Unknown',
    "avatar" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subreddits" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "bio" VARCHAR(400),
    "avatar" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "subreddits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_email_username_key" ON "users"("id", "email", "username");

-- CreateIndex
CREATE UNIQUE INDEX "subreddits_id_name_key" ON "subreddits"("id", "name");

-- AddForeignKey
ALTER TABLE "subreddits" ADD CONSTRAINT "subreddits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
