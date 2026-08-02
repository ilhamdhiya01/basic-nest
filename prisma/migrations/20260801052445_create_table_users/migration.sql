-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
