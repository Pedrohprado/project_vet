export type PetSpecies = 'DOG' | 'CAT' | 'OTHER';
export type PetSex = 'MALE' | 'FEMALE' | 'UNKNOWN';

export type PetSummary = {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  sex: PetSex;
  birthDate: string | null;
  color: string | null;
  weightKg: string | null;
  photoUrl: string | null;
  isCastrated: boolean;
  createdAt: string;
};

export type Tutor = {
  id: string;
  clinicId: string;
  name: string;
  document: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  zipCode: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TutorWithPets = Tutor & {
  pets: PetSummary[];
};

export type TutorsListResponse = {
  items: TutorWithPets[];
  total: number;
  page: number;
  limit: number;
};

export type CreateTutorPayload = {
  name: string;
  document?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  notes?: string;
};

export type UpdateTutorPayload = Partial<CreateTutorPayload>;
