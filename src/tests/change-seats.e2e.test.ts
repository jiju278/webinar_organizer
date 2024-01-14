import * as request from 'supertest';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user.seeds.e2e';
import {
  IWebinarRepository,
  I_WEBINAR_REPOSITORY,
} from 'src/webinars/ports/webinar.repository.interface';
import { e2eWebinars } from './seeds/webinar.seeds.e2e';

describe('Feature: changing the number of seats', () => {
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
    it('should change the number of seats', async () => {
      const seats = 100;
      const id = e2eWebinars.webinar1.entity.props.id;
      const result = await request(app.getHttpServer())
        .put(`/webinars/${id}/seats`)
        .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
        .send({
          seats,
        });

      expect(result.status).toBe(200);

      const webinarRepository =
        app.get<IWebinarRepository>(I_WEBINAR_REPOSITORY);
      const webinar = await webinarRepository.findById(id);

      expect(webinar).toBeDefined();
      expect(webinar.props.seats).toEqual(seats);
    });
  });

  describe('Scenario: the user is not authenticated', () => {
    it('should reject', async () => {
      const seats = 100;
      const id = e2eWebinars.webinar1.entity.props.id;

      const result = await request(app.getHttpServer())
        .put(`/webinars/${id}/seats`)
        .send({
          seats,
        });

      expect(result.status).toBe(403);
    });
  });
});
