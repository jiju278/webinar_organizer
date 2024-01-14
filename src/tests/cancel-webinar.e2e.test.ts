import * as request from 'supertest';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user.seeds.e2e';
import {
  IWebinarRepository,
  I_WEBINAR_REPOSITORY,
} from 'src/webinars/ports/webinar.repository.interface';
import { e2eWebinars } from './seeds/webinar.seeds.e2e';

describe('Feature: canceling the webinar', () => {
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
    it('should cancel the webinar', async () => {
      const id = e2eWebinars.webinar1.entity.props.id;

      const result = await request(app.getHttpServer())
        .delete(`/webinars/${id}`)
        .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken());

      expect(result.status).toBe(200);

      const webinarRepository =
        app.get<IWebinarRepository>(I_WEBINAR_REPOSITORY);
      const webinar = await webinarRepository.findById(id);
      expect(webinar).toBeNull();
    });
  });

  describe('Scenario: the user is not authenticated', () => {
    it('should reject', async () => {
      const id = e2eWebinars.webinar1.entity.props.id;

      const result = await request(app.getHttpServer()).delete(
        `/webinars/${id}`,
      );

      expect(result.status).toBe(403);
    });
  });
});
