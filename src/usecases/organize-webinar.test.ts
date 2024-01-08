import {
  IIDGenerator,
  IWebinarRepository,
  OrganizeWebinarUseCase,
  Webinar,
} from './organize-webinar.usecase';

describe('Feature: organizing a webinar', () => {
  test('Create a webinar', async () => {
    class InMemoryWebinarRepository implements IWebinarRepository {
      public database: Webinar[] = [];
      async create(webinar: Webinar): Promise<void> {
        this.database.push(webinar);
      }
    }

    class FixedIdGenerator implements IIDGenerator {
      generate(): string {
        return 'id-1';
      }
    }
    const webinarRepository = new InMemoryWebinarRepository();
    const idGenerator = new FixedIdGenerator();
    const organizeWebinarUseCase = new OrganizeWebinarUseCase(
      webinarRepository,
      idGenerator,
    );

    const result = await organizeWebinarUseCase.execute({
      title: 'My first webinar',
      seats: 100,
      startDate: new Date('2024-01-20T10:00:00.000Z'),
      endDate: new Date('2024-01-21T10:00:00.000Z'),
    });

    expect(webinarRepository.database.length).toBe(1);

    const createdWebinar = webinarRepository.database[0];
    expect(createdWebinar.props.title).toBe('My first webinar');
    expect(createdWebinar.props.seats).toBe(100);
    expect(createdWebinar.props.startDate).toEqual(
      new Date('2024-01-20T10:00:00.000Z'),
    );
    expect(createdWebinar.props.endDate).toEqual(
      new Date('2024-01-21T10:00:00.000Z'),
    );

    expect(result.id).toBe('id-1');
  });
});
