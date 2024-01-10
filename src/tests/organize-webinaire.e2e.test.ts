import * as request from 'supertest';
import { addDays } from 'date-fns';
import { TestApp } from './test-app';
import { e2eUsers } from './user-seeds';
import {
  IWebinarRepository,
  I_WEBINAR_REPOSITORY,
} from 'src/ports/webinar.repository.interface';

describe('Feature: organizing a webinar', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([e2eUsers.johnDoe]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: happy path', () => {
    it('should create a webinar', async () => {
      const startDate = addDays(new Date(), 4);
      const endDate = addDays(new Date(), 5);
      const result = await request(app.getHttpServer())
        .post('/webinars')
        .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
        .send({
          title: 'My first webinar',
          seats: 100,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

      expect(result.status).toBe(201);
      expect(result.body).toEqual({ id: expect.any(String) });

      const webinarRepository =
        app.get<IWebinarRepository>(I_WEBINAR_REPOSITORY);
      const webinar = await webinarRepository.findById(result.body.id);

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
