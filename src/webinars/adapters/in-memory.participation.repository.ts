import { Participation } from '../entities/participation.entity';
import { IParticipationRepository } from '../ports/participation.repository.interface';

export class InMemoryParticipationRepository
  implements IParticipationRepository
{
  constructor(public readonly database: Participation[] = []) {}
  async findByWebinarId(id: string): Promise<Participation[]> {
    return this.database.filter((p) => p.props.webinarId === id);
  }
}
