/** Normaliza idade salva (~2 anos e 5 meses) para só anos arredondados. */
export function displayApproximateAge(
  approximateAge: string | null | undefined,
): string | null {
  if (!approximateAge?.trim()) return null;

  const value = approximateAge.trim();
  const withMonths = value.match(
    /^~?(\d+)\s*anos?\s+e\s+(\d+)\s*m[eê]s(?:es)?$/i,
  );
  if (withMonths) {
    const years = Number(withMonths[1]);
    const months = Number(withMonths[2]);
    const rounded = months >= 6 ? years + 1 : years;
    return rounded === 1 ? '~1 ano' : `~${rounded} anos`;
  }

  const oneYearWithMonths = value.match(
    /^~?1\s*ano\s+e\s+(\d+)\s*m[eê]s(?:es)?$/i,
  );
  if (oneYearWithMonths) {
    const months = Number(oneYearWithMonths[1]);
    const rounded = months >= 6 ? 2 : 1;
    return rounded === 1 ? '~1 ano' : `~${rounded} anos`;
  }

  return value;
}

export function formatApproximateAge(
  birthDate: string | Date | null | undefined,
): string | null {
  if (!birthDate) return null;

  const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  let years = now.getFullYear() - date.getFullYear();
  let months = now.getMonth() - date.getMonth();

  if (now.getDate() < date.getDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return null;

  if (years === 0) {
    if (months <= 0) return '~1 mês';
    return months === 1 ? '~1 mês' : `~${months} meses`;
  }

  const roundedYears = months >= 6 ? years + 1 : years;
  return roundedYears === 1 ? '~1 ano' : `~${roundedYears} anos`;
}
