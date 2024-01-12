import { Entity } from 'src/shared/entity';

type ParticipationProps = {
  userId: string;
  webinarId: string;
};

export class Participation extends Entity<ParticipationProps> {}
