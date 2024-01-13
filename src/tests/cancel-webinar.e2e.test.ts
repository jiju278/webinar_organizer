import * as request from 'supertest';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user.seeds.e2e';
import {
  IWebinarRepository,
  I_WEBINAR_REPOSITORY,
} from 'src/webinars/ports/webinar.repository.interface';
import { WebinarFixture } from './fixtures/webinar.fixture';
import { Webinar } from 'src/webinars/entities/webinar.entity';
import { addDays } from 'date-fns';

describe('Feature: canceling the webinar', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([
      e2eUsers.johnDoe,
      new WebinarFixture(
        new Webinar({
          id: 'id-1',
          organizerId: e2eUsers.johnDoe.entity.props.id,
          seats: 50,
          title: 'My first webinar',
          startDate: addDays(new Date(), 4),
          endDate: addDays(new Date(), 5),
        }),
      ),
    ]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: happy path', () => {
    it('should cancel the webinar', async () => {
      const id = 'id-1';
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
      const id = 'id-1';

      const result = await request(app.getHttpServer()).delete(
        `/webinars/${id}`,
      );

      expect(result.status).toBe(403);
    });
  });
});
