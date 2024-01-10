import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import * as request from 'supertest';
import { addDays } from 'date-fns';
import { InMemoryUserRepository } from 'src/adapters/in-memory.user.repository';
import { User } from 'src/entities/user.entity';
import { InMemoryWebinarRepository } from 'src/adapters/in-memory.webinar.repository';
import { INestApplication } from '@nestjs/common';

describe('Feature: organizing a webinar', () => {
  let app: INestApplication;
  const johnDoe = new User({
    id: 'john-doe',
    emailAddress: 'johndoe@gmail.com',
    password: 'azerty',
  });

  const token = Buffer.from(
    `${johnDoe.props.emailAddress}:${johnDoe.props.password}`,
  ).toString('base64');

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Scenario: happy path', () => {
    it('should create a webinar', async () => {
      const userRepository = app.get(InMemoryUserRepository);
      await userRepository.create(johnDoe);

      const startDate = addDays(new Date(), 4);
      const endDate = addDays(new Date(), 5);
      const result = await request(app.getHttpServer())
        .post('/webinars')
        .set('Authorization', `Basic ${token}`)
        .send({
          title: 'My first webinar',
          seats: 100,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

      expect(result.status).toBe(201);
      expect(result.body).toEqual({ id: expect.any(String) });

      const webinarRepository = app.get(InMemoryWebinarRepository);
      const webinar = webinarRepository.database[0];

      expect(webinar).toBeDefined();
      expect(webinar.props).toEqual({
        id: result.body.id,
        organizerId: 'john-doe',
        title: 'My first webinar',
        seats: 100,
        startDate,
        endDate,
      });
    });
  });

  describe('Scenario: the user is not authenticated', () => {
    it('should reject the creation of a webinar', async () => {
      const result = await request(app.getHttpServer())
        .post('/webinars')
        .send({
          title: 'My first webinar',
          seats: 100,
          startDate: addDays(new Date(), 4).toISOString(),
          endDate: addDays(new Date(), 5).toISOString(),
        });

      expect(result.status).toBe(403);
    });
  });
});
