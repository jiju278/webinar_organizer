import { testUsers } from 'src/users/tests/user.seeds';
import { InMemoryParticipationRepository } from '../adapters/in-memory.participation.repository';
import { ReserveSeatUseCase } from './reserve-seats.usecase';
import { Webinar } from '../entities/webinar.entity';
import { InMemoryMailer } from 'src/core/adapters/in-memory.mailer';
import { InMemoryWebinarRepository } from '../adapters/in-memory.webinar.repository';
import { InMemoryUserRepository } from 'src/users/adapters/in-memory.user.repository';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found.exception';
import { Participation } from '../entities/participation.entity';
import { NoMoreSeatAvailableException } from '../exceptions/no-more-seat-available.exception';
import { SeatAlreadyReservedException } from '../exceptions/seat-already-reserved.exception';

describe('Feature: Booking a seat', () => {
  let participationRepository: InMemoryParticipationRepository;
  let usecase: ReserveSeatUseCase;
  let mailer: InMemoryMailer;
  let webinarRepository: InMemoryWebinarRepository;
  let userRepository: InMemoryUserRepository;

  function expectParticipationNotToBeCreated() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinar.props.id,
    );
    expect(storedParticipation).toBeNull();
  }

  function expectParticipationToBeCreated() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinar.props.id,
    );
    expect(storedParticipation).not.toBeNull();
  }
  const webinar = new Webinar({
    id: 'id-1',
    organizerId: 'alice',
    title: 'My first webinar',
    seats: 50,
    startDate: new Date('2024-01-20T10:00:00.000Z'),
    endDate: new Date('2024-01-21T10:00:00.000Z'),
  });

  const webinarWithFewSeats = new Webinar({
    id: 'id-2',
    organizerId: 'alice',
    title: 'My first webinar',
    seats: 1,
    startDate: new Date('2024-01-20T10:00:00.000Z'),
    endDate: new Date('2024-01-21T10:00:00.000Z'),
  });

  const charlesParticipation = new Participation({
    userId: testUsers.charles.props.id,
    webinarId: webinarWithFewSeats.props.id,
  });
  beforeEach(async () => {
    participationRepository = new InMemoryParticipationRepository([
      charlesParticipation,
    ]);
    mailer = new InMemoryMailer();
    webinarRepository = new InMemoryWebinarRepository([
      webinar,
      webinarWithFewSeats,
    ]);
    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
      testUsers.charles,
    ]);
    usecase = new ReserveSeatUseCase(
      participationRepository,
      mailer,
      webinarRepository,
      userRepository,
    );
  });
  describe('Scenario: Happy path', () => {
    const payload = {
      user: testUsers.bob,
      webinarId: webinar.props.id,
    };
    test('Should book a seat', async () => {
      await usecase.execute(payload);
      expectParticipationToBeCreated();
    });

    test('Should send an e-mail to the organizer', async () => {
      await usecase.execute(payload);

      expect(mailer.sentEmails[0]).toEqual({
        to: testUsers.alice.props.emailAddress,
        subject: 'New participation',
        body: `A new user has reserved a seat for your webinar "${webinar.props.title}"`,
      });
    });

    test('Should send an e-mail to the participants', async () => {
      await usecase.execute(payload);

      expect(mailer.sentEmails[1]).toEqual({
        to: testUsers.bob.props.emailAddress,
        subject: 'Your participation to a webinar',
        body: `You have reserved a seat for the webinar "${webinar.props.title}"`,
      });
    });
  });

  describe('Scenario: The webinar does not exist', () => {
    const payload = {
      user: testUsers.bob,
      webinarId: 'random-id',
    };
    test('Should fail', async () => {
      await expect(() => usecase.execute(payload)).rejects.toThrowError(
        WebinarNotFoundException,
      );
      expectParticipationNotToBeCreated();
    });
  });

  describe('Scenario: The webinar is full', () => {
    const payload = {
      user: testUsers.bob,
      webinarId: webinarWithFewSeats.props.id,
    };
    test('Should fail', async () => {
      await expect(() => usecase.execute(payload)).rejects.toThrowError(
        NoMoreSeatAvailableException,
      );
      expectParticipationNotToBeCreated();
    });
  });

  describe('Scenario: The user already participates to the webinar', () => {
    const payload = {
      user: testUsers.charles,
      webinarId: webinarWithFewSeats.props.id,
    };
    test('Should fail', async () => {
      await expect(() => usecase.execute(payload)).rejects.toThrowError(
        SeatAlreadyReservedException,
      );
      expectParticipationNotToBeCreated();
    });
  });
});
