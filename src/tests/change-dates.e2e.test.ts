import * as request from 'supertest';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user.seeds.e2e';
import {
  IWebinarRepository,
  I_WEBINAR_REPOSITORY,
} from 'src/webinars/ports/webinar.repository.interface';
import { addDays } from 'date-fns';
import { e2eWebinars } from './seeds/webinar.seeds.e2e';

describe('Feature: changing the dates', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([e2eUsers.johnDoe, e2eWebinars.webinar1]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: happy path', () => {
    it('should change the dates', async () => {
      const startDate = addDays(new Date(), 5);
      const endDate = addDays(new Date(), 6);
      const id = e2eWebinars.webinar1.entity.props.id;

      const result = await request(app.getHttpServer())
        .put(`/webinars/${id}/dates`)
        .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
        .send({
          startDate,
          endDate,
        });

      expect(result.status).toBe(200);

      const webinarRepository =
        app.get<IWebinarRepository>(I_WEBINAR_REPOSITORY);
      const webinar = await webinarRepository.findById(id);

      expect(webinar).toBeDefined();
      expect(webinar.props.startDate).toEqual(startDate);
      expect(webinar.props.endDate).toEqual(endDate);
    });
  });

  describe('Scenario: the user is not authenticated', () => {
    it('should reject', async () => {
      const startDate = addDays(new Date(), 5);
      const endDate = addDays(new Date(), 6);
      const id = e2eWebinars.webinar1.entity.props.id;

      const result = await request(app.getHttpServer())
        .put(`/webinars/${id}/dates`)
        .send({
          startDate,
          endDate,
        });

      expect(result.status).toBe(403);
    });
  });
});
