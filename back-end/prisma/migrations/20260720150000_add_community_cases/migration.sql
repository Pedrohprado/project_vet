-- CreateTable
CREATE TABLE "CommunityCase" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "sourceConsultationId" TEXT,
    "title" TEXT NOT NULL,
    "species" "PetSpecies" NOT NULL,
    "sex" "PetSex" NOT NULL DEFAULT 'UNKNOWN',
    "approximateAge" TEXT,
    "weightKg" DECIMAL(6,2),
    "temperature" DECIMAL(4,1),
    "mainComplaint" TEXT,
    "history" TEXT,
    "physicalExam" TEXT,
    "diagnosis" TEXT,
    "conduct" TEXT,
    "observations" TEXT,
    "authorNote" TEXT,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityCaseLike" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityCaseLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityCaseComment" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityCaseComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommunityCase_sourceConsultationId_key" ON "CommunityCase"("sourceConsultationId");

-- CreateIndex
CREATE INDEX "CommunityCase_createdAt_idx" ON "CommunityCase"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityCase_authorId_idx" ON "CommunityCase"("authorId");

-- CreateIndex
CREATE INDEX "CommunityCase_clinicId_idx" ON "CommunityCase"("clinicId");

-- CreateIndex
CREATE INDEX "CommunityCaseLike_userId_idx" ON "CommunityCaseLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityCaseLike_caseId_userId_key" ON "CommunityCaseLike"("caseId", "userId");

-- CreateIndex
CREATE INDEX "CommunityCaseComment_caseId_createdAt_idx" ON "CommunityCaseComment"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityCaseComment_authorId_idx" ON "CommunityCaseComment"("authorId");

-- AddForeignKey
ALTER TABLE "CommunityCase" ADD CONSTRAINT "CommunityCase_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityCase" ADD CONSTRAINT "CommunityCase_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityCase" ADD CONSTRAINT "CommunityCase_sourceConsultationId_fkey" FOREIGN KEY ("sourceConsultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityCaseLike" ADD CONSTRAINT "CommunityCaseLike_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CommunityCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityCaseLike" ADD CONSTRAINT "CommunityCaseLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityCaseComment" ADD CONSTRAINT "CommunityCaseComment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CommunityCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityCaseComment" ADD CONSTRAINT "CommunityCaseComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
