import { FixedIdGenerator } from 'src/adapters/fixed-id-generator';
import { OrganizeWebinarUseCase } from './organize-webinar.usecase';
import { InMemoryWebinarRepository } from 'src/adapters/in-memory.webinar.repository';
import { Webinar } from 'src/entities/webinar.entity';
import { FixedDateGenerator } from 'src/adapters/fixed-date-generator';
import { User } from 'src/entities/user.entity';

describe('Feature: organizing a webinar', () => {
  const johnDoe = new User({ id: 'john-doe' });
  let webinarRepository: InMemoryWebinarRepository;
  let idGenerator: FixedIdGenerator;
  let organizeWebinarUseCase: OrganizeWebinarUseCase;
  let dateGenerator: FixedDateGenerator;

  function expectWebinaireToEqual(webinar: Webinar) {
    expect(webinar.props).toEqual({
      id: 'id-1',
      organizerId: 'john-doe',
      title: 'My first webinar',
      seats: 100,
      startDate: new Date('2024-01-20T10:00:00.000Z'),
      endDate: new Date('2024-01-21T10:00:00.000Z'),
    });
  }
  beforeEach(() => {
    webinarRepository = new InMemoryWebinarRepository();
    idGenerator = new FixedIdGenerator();
    dateGenerator = new FixedDateGenerator();
    organizeWebinarUseCase = new OrganizeWebinarUseCase(
      webinarRepository,
      idGenerator,
      dateGenerator,
    );
  });

  describe('Scenario: happy path', () => {
    const payload = {
      user: johnDoe,
      title: 'My first webinar',
      seats: 100,
      startDate: new Date('2024-01-20T10:00:00.000Z'),
      endDate: new Date('2024-01-21T10:00:00.000Z'),
    };

    test('Creating a webinar', async () => {
      const result = await organizeWebinarUseCase.execute(payload);
      expect(result.id).toBe('id-1');
    });

    test('Insertion of webinar into the database', async () => {
      await organizeWebinarUseCase.execute(payload);

      expect(webinarRepository.database.length).toBe(1);

      const createdWebinar = webinarRepository.database[0];

      expectWebinaireToEqual(createdWebinar);
    });
  });

  describe('Scenario: the webinar happens too soon', () => {
    const payload = {
      user: johnDoe,
      title: 'My first webinar',
      seats: 100,
      startDate: new Date('2024-01-01T00:00:00.000Z'),
      endDate: new Date('2024-01-02T10:00:00.000Z'),
    };

    test('Throw an error', async () => {
      await expect(() =>
        organizeWebinarUseCase.execute(payload),
      ).rejects.toThrowError(
        'The webinar must happen in at least 3 days before',
      );
    });

    test('There is no entry in the database', async () => {
      try {
        await organizeWebinarUseCase.execute(payload);
      } catch (e) {}

      expect(webinarRepository.database.length).toBe(0);
    });
  });

  describe('Scenario: the webinar has too many seats', () => {
    const payload = {
      user: johnDoe,
      title: 'My first webinar',
      seats: 1500,
      startDate: new Date('2024-01-25T10:00:00.000Z'),
      endDate: new Date('2024-01-26T10:00:00.000Z'),
    };

    test('Throw an error', async () => {
      await expect(() =>
        organizeWebinarUseCase.execute(payload),
      ).rejects.toThrowError('The webinar must have a maximum of 1000 seats');
    });

    test('There is no new webinar in the database', async () => {
      try {
        await organizeWebinarUseCase.execute(payload);
      } catch (e) {}

      expect(webinarRepository.database.length).toBe(0);
    });
  });

  describe('Scenario: the webinar has no seat', () => {
    const payload = {
      user: johnDoe,
      title: 'My first webinar',
      seats: 0,
      startDate: new Date('2024-01-25T10:00:00.000Z'),
      endDate: new Date('2024-01-26T10:00:00.000Z'),
    };

    test('Throw an error', async () => {
      await expect(() =>
        organizeWebinarUseCase.execute(payload),
      ).rejects.toThrowError('The webinar must have at least 1 seat');
    });

    test('There is no new webinar in the database', async () => {
      try {
        await organizeWebinarUseCase.execute(payload);
      } catch (e) {}

      expect(webinarRepository.database.length).toBe(0);
    });
  });
});
