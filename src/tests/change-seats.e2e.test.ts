import * as request from 'supertest';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user-seeds';
import {
  IWebinarRepository,
  I_WEBINAR_REPOSITORY,
} from 'src/webinars/ports/webinar.repository.interface';
import { WebinarFixture } from './fixtures/webinar.fixture';
import { Webinar } from 'src/webinars/entites/webinar.entity';

describe('Feature: changing the number of seats', () => {
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
          startDate: new Date('2024-01-20T10:00:00.000Z'),
          endDate: new Date('2024-01-21T10:00:00.000Z'),
        }),
      ),
    ]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: happy path', () => {
    it('should change the number of seats', async () => {
      const seats = 100;
      const id = 'id-1';
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
      const id = 'id-1';

      const result = await request(app.getHttpServer())
        .put(`/webinars/${id}/seats`)
        .send({
          seats,
        });

      expect(result.status).toBe(403);
    });
  });
});
