import { Participation } from 'src/webinars/entities/participation.entity';
import { IParticipationRepository } from 'src/webinars/ports/participation.repository.interface';
import { MongoParticipation } from './mongo-participation';
import { Model } from 'mongoose';

export class MongoParticipationRepository implements IParticipationRepository {
  constructor(private readonly model: Model<MongoParticipation.SchemaClass>) {}

  async create(participation: Participation): Promise<void> {
    await this.model.create({
      _id: MongoParticipation.SchemaClass.makeId(participation),
      userId: participation.props.userId,
      webinarId: participation.props.webinarId,
    });
  }

  async findOne(userId: string, webinarId: string): Promise<Participation> {
    const record = await this.model.findOne({
      userId,
      webinarId,
    });
    if (!record) {
      return null;
    }

    return new Participation({
      userId: record.userId,
      webinarId: record.webinarId,
    });
  }
  async findByWebinarId(webinarId: string): Promise<Participation[]> {
    const participations = await this.model.find({ webinarId });
    return participations.map(
      (record) =>
        new Participation({
          userId: record.userId,
          webinarId: record.webinarId,
        }),
    );
  }
  async findParticipationCount(webinarId: string): Promise<number> {
    return this.model.countDocuments({ webinarId });
  }
  async delete(participation: Participation): Promise<void> {
    await this.model.deleteOne({
      userId: participation.props.userId,
      webinarId: participation.props.webinarId,
    });
  }
}
