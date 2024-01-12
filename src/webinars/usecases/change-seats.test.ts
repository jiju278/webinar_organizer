import { User } from 'src/users/entities/user.entity';
import { ChangeSeatsUseCase } from './change-seats.usecase';
import { Webinar } from '../entites/webinar.entity';
import { InMemoryWebinarRepository } from '../adapters/in-memory.webinar.repository';

describe('Feature: changing the number of seats', () => {
  let useCase: ChangeSeatsUseCase;
  let webinarRepository: InMemoryWebinarRepository;
  function expectSeatsToRemainUnchanged() {
    const webinar = webinarRepository.findByIdSync('id-1');
    expect(webinar.props.seats).toBe(50);
  }
  const johnDoe = new User({
    id: 'john-doe',
    emailAddress: 'johndoe@gmail.com',
    password: 'azerty',
  });

  const bob = new User({
    id: 'bob',
    emailAddress: 'bob@gmail.com',
    password: 'azerty',
  });

  const webinar = new Webinar({
    id: 'id-1',
    organizerId: 'john-doe',
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
    test('Change the number of seats', async () => {
      await useCase.execute({
        user: johnDoe,
        webinarId: 'id-1',
        seats: 100,
      });

      const webinar = await webinarRepository.findById('id-1');
      expect(webinar.props.seats).toBe(100);
    });
  });

  describe('Scenario: webinar does not exist', () => {
    test('Changing seats should fail', async () => {
      await expect(
        useCase.execute({
          user: johnDoe,
          webinarId: 'id-2',
          seats: 100,
        }),
      ).rejects.toThrow('Webinar does not exist');
      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: update webinar by someone else', () => {
    test('Changing seats should fail', async () => {
      await expect(
        useCase.execute({
          user: bob,
          webinarId: 'id-1',
          seats: 100,
        }),
      ).rejects.toThrow('You are not allowed to update the webinar');
      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: changing seats with an inferior number', () => {
    test('Changing seats should fail', async () => {
      await expect(
        useCase.execute({
          user: johnDoe,
          webinarId: 'id-1',
          seats: 40,
        }),
      ).rejects.toThrow('Reducing the number of seats is impossible');
      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: changing seats with a higher number', () => {
    test('Changing seats should fail', async () => {
      await expect(
        useCase.execute({
          user: johnDoe,
          webinarId: 'id-1',
          seats: 1001,
        }),
      ).rejects.toThrow('The webinar must have a maximum of 1000 seats');
      expectSeatsToRemainUnchanged();
    });
  });
});
