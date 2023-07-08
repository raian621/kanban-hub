-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passhash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstName" VARCHAR(127) NOT NULL,
    "lastName" VARCHAR(127) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
