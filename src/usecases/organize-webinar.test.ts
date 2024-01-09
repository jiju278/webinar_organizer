import { FixedIdGenerator } from 'src/adapters/fixed-id-generator';
import { OrganizeWebinarUseCase } from './organize-webinar.usecase';
import { InMemoryWebinarRepository } from 'src/adapters/in-memory.webinar.repository';
import { Webinar } from 'src/entities/webinar.entity';

describe('Feature: organizing a webinar', () => {
  let webinarRepository: InMemoryWebinarRepository;
  let idGenerator: FixedIdGenerator;
  let organizeWebinarUseCase: OrganizeWebinarUseCase;

  function expectWebinaireToEqual(webinar: Webinar) {
    expect(webinar.props).toEqual({
      id: 'id-1',
      title: 'My first webinar',
      seats: 100,
      startDate: new Date('2024-01-20T10:00:00.000Z'),
      endDate: new Date('2024-01-21T10:00:00.000Z'),
    });
  }
  beforeEach(() => {
    webinarRepository = new InMemoryWebinarRepository();
    idGenerator = new FixedIdGenerator();
    organizeWebinarUseCase = new OrganizeWebinarUseCase(
      webinarRepository,
      idGenerator,
    );
  });

  describe('Scenario: happy path', () => {
    const payload = {
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
});
