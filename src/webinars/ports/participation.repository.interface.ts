import { Participation } from '../entities/participation.entity';

export interface IParticipationRepository {
  findByWebinarId(id: string): Promise<Participation[]>;
}
