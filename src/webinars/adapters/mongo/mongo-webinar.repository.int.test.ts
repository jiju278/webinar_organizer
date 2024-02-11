import { Model } from 'mongoose';
import { TestApp } from 'src/tests/utils/test-app';
import { getModelToken } from '@nestjs/mongoose';
import { Webinar } from 'src/webinars/entities/webinar.entity';
import { MongoWebinar } from './mongo-webinar';
import { MongoWebinarRepository } from './mongo-webinar.repository';

describe('MongoWebinarRepository', () => {
  let app: TestApp;
  let model: Model<MongoWebinar.SchemaClass>;
  let repository: MongoWebinarRepository;
  const webinar = new Webinar({
    id: 'webinar-id',
    organizerId: 'organizerId',
    title: 'Learn Typescript',
    seats: 10,
    startDate: new Date('2024-01-01T00:00:00.000Z'),
    endDate: new Date('2024-01-01T02:00:00.000Z'),
  });
  const cqrsWebinar = new Webinar({
    id: 'cqrs-webinar-id',
    organizerId: 'organizerId',
    title: 'CQRS',
    seats: 10,
    startDate: new Date('2024-01-01T00:00:00.000Z'),
    endDate: new Date('2024-01-01T02:00:00.000Z'),
  });

  async function createWebinarInDatabase(webinar: Webinar) {
    const record = new model({
      _id: webinar.props.id,
      organizerId: webinar.props.organizerId,
      title: webinar.props.title,
      seats: webinar.props.seats,
      startDate: webinar.props.startDate,
      endDate: webinar.props.endDate,
    });
    await record.save();
  }
  beforeEach(async () => {
    app = new TestApp();
    await app.setup();

    model = app.get<Model<MongoWebinar.SchemaClass>>(
      getModelToken(MongoWebinar.CollectionName),
    );

    repository = new MongoWebinarRepository(model);
    await createWebinarInDatabase(webinar);
  }, 30000 /* timeout */);

  describe('findById', () => {
    it('should find the webinar corresponding to the id', async () => {
      const foundWebinar = await repository.findById(webinar.props.id);

      expect(webinar.props).toEqual(foundWebinar.props);
    });

    it('should not find the webinar corresponding to the id', async () => {
      const foundWebinar = await repository.findById('does not exist');

      expect(foundWebinar).toEqual(null);
    });
  });

  describe('create', () => {
    it('should create the webinar', async () => {
      await repository.create(cqrsWebinar);
      const record = await model.findById(cqrsWebinar.props.id);
      expect(record?.toObject()).toEqual({
        __v: 0,
        _id: cqrsWebinar.props.id,
        organizerId: cqrsWebinar.props.organizerId,
        title: cqrsWebinar.props.title,
        seats: cqrsWebinar.props.seats,
        startDate: cqrsWebinar.props.startDate,
        endDate: cqrsWebinar.props.endDate,
      });
    });
  });

  describe('update', () => {
    it('should update the webinar', async () => {
      await createWebinarInDatabase(cqrsWebinar);
      const cqrsCopy = cqrsWebinar.clone() as Webinar;
      cqrsCopy.update({
        title: 'CQRS - Command Query Responsability Segregation',
      });
      await repository.update(cqrsCopy);
      const record = await model.findById(cqrsWebinar.props.id);
      expect(record?.toObject()).toEqual({
        __v: 0,
        _id: cqrsCopy.props.id,
        organizerId: cqrsCopy.props.organizerId,
        title: cqrsCopy.props.title,
        seats: cqrsCopy.props.seats,
        startDate: cqrsCopy.props.startDate,
        endDate: cqrsCopy.props.endDate,
      });

      expect(cqrsCopy.props).toEqual(cqrsCopy.initialState);
    });
  });

  describe('delete', () => {
    it('should delete the webinar', async () => {
      await repository.delete(webinar);
      const record = await model.findById(webinar.props.id);
      expect(record).toEqual(null);
    });
  });

  afterEach(async () => {
    await app.cleanup();
  });
});
