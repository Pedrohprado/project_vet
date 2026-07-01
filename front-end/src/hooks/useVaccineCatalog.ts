import { useQuery } from '@tanstack/react-query';
import { listVaccineCatalog } from '@/api/vaccinations';

export const VACCINE_CATALOG_QUERY_KEY = 'vaccine-catalog';

export function useVaccineCatalog() {
  return useQuery({
    queryKey: [VACCINE_CATALOG_QUERY_KEY],
    queryFn: listVaccineCatalog,
  });
}
