type CaseFieldProps = {
  label: string;
  value: string | null | undefined;
};

export function CommunityCaseField({ label, value }: CaseFieldProps) {
  if (!value?.trim()) return null;
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{label}</p>
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{value}</p>
    </div>
  );
}

type CommunityCaseBodyProps = {
  mainComplaint: string | null;
  history: string | null;
  physicalExam: string | null;
  diagnosis: string | null;
  conduct: string | null;
  observations: string | null;
  temperature?: string | null;
};

export function CommunityCaseBody({
  mainComplaint,
  history,
  physicalExam,
  diagnosis,
  conduct,
  observations,
  temperature,
}: CommunityCaseBodyProps) {
  return (
    <div className="space-y-3">
      <CommunityCaseField
        label="Temperatura"
        value={temperature ? `${temperature} °C` : null}
      />
      <CommunityCaseField label="Queixa" value={mainComplaint} />
      <CommunityCaseField label="Histórico" value={history} />
      <CommunityCaseField label="Exame físico" value={physicalExam} />
      <CommunityCaseField label="Diagnóstico" value={diagnosis} />
      <CommunityCaseField label="Conduta" value={conduct} />
      <CommunityCaseField label="Observações" value={observations} />
    </div>
  );
}

export function hasExpandableCaseContent(caseData: CommunityCaseBodyProps) {
  return Boolean(
    caseData.temperature?.trim() ||
      caseData.mainComplaint?.trim() ||
      caseData.history?.trim() ||
      caseData.physicalExam?.trim() ||
      caseData.diagnosis?.trim() ||
      caseData.conduct?.trim() ||
      caseData.observations?.trim(),
  );
}
