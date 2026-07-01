export function formatPetAge(birthDate: string | null | undefined) {
  if (!birthDate) return '—';

  const birth = new Date(birthDate);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (today.getDate() < birth.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years >= 1) {
    return years === 1 ? '1 ano' : `${years} anos`;
  }

  if (months >= 1) {
    return months === 1 ? '1 mês' : `${months} meses`;
  }

  return 'Menos de 1 mês';
}

export function formatPetWeight(weightKg: string | null | undefined) {
  if (!weightKg) return '—';
  return `${weightKg} kg`;
}

export function formatBirthDate(birthDate: string | null | undefined) {
  if (!birthDate) return '—';
  return new Date(birthDate).toLocaleDateString('pt-BR');
}

export function formatTimelineDate(isoDate: string) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isUpcomingTimelineEvent(status: string | undefined) {
  return status === 'SCHEDULED' || status === 'CONFIRMED';
}
