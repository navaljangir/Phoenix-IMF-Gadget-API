-- CreateEnum
CREATE TYPE "GadgetStatus" AS ENUM ('Available', 'Deployed', 'Destroyed', 'Decommissioned');

-- CreateTable
CREATE TABLE "Gadget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codename" TEXT NOT NULL,
    "status" "GadgetStatus" NOT NULL DEFAULT 'Available',
    "decommissionedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gadget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gadget_codename_key" ON "Gadget"("codename");

-- AddForeignKey
ALTER TABLE "Gadget" ADD CONSTRAINT "Gadget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
