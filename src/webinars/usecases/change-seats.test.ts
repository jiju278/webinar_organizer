import { ChangeSeatsUseCase } from './change-seats.usecase';
import { Webinar } from '../entities/webinar.entity';
import { InMemoryWebinarRepository } from '../adapters/in-memory.webinar.repository';
import { testUsers } from 'src/users/tests/user.seeds';

describe('Feature: changing the number of seats', () => {
  let useCase: ChangeSeatsUseCase;
  let webinarRepository: InMemoryWebinarRepository;
  function expectSeatsToRemainUnchanged() {
    const webinar = webinarRepository.findByIdSync('id-1');
    expect(webinar.props.seats).toBe(50);
  }

  const webinar = new Webinar({
    id: 'id-1',
    organizerId: 'alice',
    title: 'My first webinar',
    seats: 50,
    startDate: new Date('2024-01-20T10:00:00.000Z'),
    endDate: new Date('2024-01-21T10:00:00.000Z'),
  });

  beforeEach(async () => {
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    useCase = new ChangeSeatsUseCase(webinarRepository);
  });

  describe('Scenario: happy path', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: 'id-1',
      seats: 100,
    };

    test('Change the number of seats', async () => {
      await useCase.execute(payload);

      const webinar = await webinarRepository.findById('id-1');
      expect(webinar.props.seats).toBe(100);
    });
  });

  describe('Scenario: webinar does not exist', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: 'id-2',
      seats: 100,
    };
    test('Changing seats should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'The Webinar does not exist',
      );
      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: update webinar by someone else', () => {
    const payload = {
      user: testUsers.bob,
      webinarId: 'id-1',
      seats: 100,
    };
    test('Changing seats should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'You are not allowed to update the webinar',
      );
      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: changing seats with an inferior number', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: 'id-1',
      seats: 40,
    };
    test('Changing seats should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'Reducing the number of seats is impossible',
      );
      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: changing seats with a higher number', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: 'id-1',
      seats: 1001,
    };
    test('Changing seats should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'The webinar must have a maximum of 1000 seats',
      );
      expectSeatsToRemainUnchanged();
    });
  });
});
