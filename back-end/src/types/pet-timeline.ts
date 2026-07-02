export type PetTimelineEventKind =
  | 'REGISTRATION'
  | 'CONSULTATION'
  | 'APPOINTMENT'
  | 'VACCINATION';

export type PetTimelineLinkType = 'consultation' | 'appointment' | 'vaccination';

export type PetTimelineEvent = {
  id: string;
  kind: PetTimelineEventKind;
  occurredAt: string;
  title: string;
  description: string | null;
  status?: string;
  veterinarianName: string | null;
  linkTo?: { type: PetTimelineLinkType; id: string };
};
