export type VaccineCatalogItem = {
  id: string;
  name: string;
  manufacturer: string | null;
  defaultIntervalDays: number | null;
  species: string | null;
  isActive: boolean;
};
