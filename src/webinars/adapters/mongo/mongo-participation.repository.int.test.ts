import { Model } from 'mongoose';
import { TestApp } from 'src/tests/utils/test-app';
import { MongoParticipation } from './mongo-participation';
import { MongoParticipationRepository } from './mongo-participation.repository';
import { Participation } from 'src/webinars/entities/participation.entity';
import { getModelToken } from '@nestjs/mongoose';

describe('MongoParticipationRepository', () => {
  let app: TestApp;
  let model: Model<MongoParticipation.SchemaClass>;
  let repository: MongoParticipationRepository;

  const savedParticipation = new Participation({
    webinarId: 'webinar-1',
    userId: 'user-1',
  });
  async function createParticipationInDatabase(participation: Participation) {
    const record = new model({
      _id: MongoParticipation.SchemaClass.makeId(participation),
      userId: participation.props.userId,
      webinarId: participation.props.webinarId,
    });
    await record.save();
  }

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();

    model = app.get<Model<MongoParticipation.SchemaClass>>(
      getModelToken(MongoParticipation.CollectionName),
    );
    repository = new MongoParticipationRepository(model);

    await createParticipationInDatabase(savedParticipation);
  }, 30000 /* timeout */);

  describe('findOne', () => {
    it('should find the participation', async () => {
      const participation = await repository.findOne(
        savedParticipation.props.userId,
        savedParticipation.props.webinarId,
      );

      expect(participation.props).toEqual(savedParticipation.props);
    });

    it('should find the participation', async () => {
      const participation = await repository.findOne(
        savedParticipation.props.userId,
        savedParticipation.props.webinarId,
      );

      expect(participation.props).toEqual(savedParticipation.props);
    });

    it('should return null when the participation does not exists', async () => {
      const participation = await repository.findOne('no-user', 'no-webinar');

      expect(participation).toEqual(null);
    });
  });
  describe('findByWebinaireId', () => {
    it('should return the list of participations if there is any', async () => {
      const participation = await repository.findByWebinarId(
        savedParticipation.props.webinarId,
      );

      expect(participation.length).toBe(1);
      expect(participation[0].props).toEqual(savedParticipation.props);
    });
  });

  describe('findParticipationCount', () => {
    it('should return the number of participations', async () => {
      const participation = await repository.findParticipationCount(
        savedParticipation.props.webinarId,
      );

      expect(participation).toBe(1);
    });
  });

  describe('create', () => {
    it('should create the participation', async () => {
      const participation = new Participation({
        webinarId: 'webinaire-2',
        userId: 'user-2',
      });

      await repository.create(participation);

      const record = await model.findOne({
        userId: participation.props.userId,
        webinarId: participation.props.webinarId,
      });

      expect(record?.toObject()).toEqual({
        __v: 0,
        _id: MongoParticipation.SchemaClass.makeId(participation),
        webinarId: participation.props.webinarId,
        userId: participation.props.userId,
      });
    });
  });

  describe('delete', () => {
    it('should delete the participation', async () => {
      await repository.delete(savedParticipation);

      const record = await model.findOne({
        userId: savedParticipation.props.userId,
        webinarId: savedParticipation.props.webinarId,
      });

      expect(record).toBe(null);
    });
  });

  afterEach(async () => {
    await app.cleanup();
  });
});
