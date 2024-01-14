import { Participation } from '../entities/participation.entity';

export const I_PARTICIPATION_REPOSITORY = 'I_PARTICIPATION_REPOSITORY';
export interface IParticipationRepository {
  create(participation: Participation): Promise<void>;
  findOne(userId: string, webinarId: string): Promise<Participation | null>;
  findByWebinarId(id: string): Promise<Participation[]>;
  findParticipationCount(webinarId: string): Promise<number>;
}
