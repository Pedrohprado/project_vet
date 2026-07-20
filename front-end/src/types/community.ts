import type { PetSex, PetSpecies } from '@/types/tutor';

export type CommunityCaseAuthor = {
  id: string;
  name: string;
  crmv: string | null;
};

export type CommunityCaseClinic = {
  id: string;
  name: string;
};

export type CommunityCase = {
  id: string;
  authorId: string;
  clinicId: string;
  sourceConsultationId: string | null;
  title: string;
  species: PetSpecies;
  sex: PetSex;
  approximateAge: string | null;
  weightKg: string | null;
  temperature: string | null;
  mainComplaint: string | null;
  history: string | null;
  physicalExam: string | null;
  diagnosis: string | null;
  conduct: string | null;
  observations: string | null;
  authorNote: string | null;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  createdAt: string;
  updatedAt: string;
  author: CommunityCaseAuthor;
  clinic: CommunityCaseClinic;
};

export type CommunityCaseListResponse = {
  items: CommunityCase[];
  total: number;
  page: number;
  limit: number;
};

export type CommunityCaseComment = {
  id: string;
  caseId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: CommunityCaseAuthor;
};

export type CreateCommunityCasePayload = {
  consultationId: string;
  title: string;
  authorNote?: string | null;
};

export type UpdateCommunityCasePayload = {
  title: string;
  authorNote?: string | null;
};
