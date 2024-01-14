import { Participation } from '../entities/participation.entity';
import { IParticipationRepository } from '../ports/participation.repository.interface';

export class InMemoryParticipationRepository
  implements IParticipationRepository
{
  constructor(public readonly database: Participation[] = []) {}

  async findOne(
    userId: string,
    webinarId: string,
  ): Promise<Participation | null> {
    return this.findOneSync(userId, webinarId);
  }
  async findByWebinarId(id: string): Promise<Participation[]> {
    return this.database.filter((p) => p.props.webinarId === id);
  }

  async create(participation: Participation): Promise<void> {
    this.database.push(participation);
  }

  findOneSync(userId: string, webinarId: string): Participation | null {
    return (
      this.database.find(
        (participation) =>
          participation.props.userId === userId &&
          participation.props.webinarId === webinarId,
      ) ?? null
    );
  }

  async findParticipationCount(webinarId: string): Promise<number> {
    return this.database.reduce(
      (count, participation) =>
        participation.props.webinarId === webinarId ? count + 1 : count,
      0,
    );
  }
}
