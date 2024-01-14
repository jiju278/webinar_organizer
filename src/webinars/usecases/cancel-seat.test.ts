import { testUsers } from 'src/users/tests/user.seeds';
import { CancelSeatUseCase } from './cancel-seat.usecase';
import { Webinar } from '../entities/webinar.entity';
import { Participation } from '../entities/participation.entity';
import { InMemoryWebinarRepository } from '../adapters/in-memory.webinar.repository';
import { InMemoryParticipationRepository } from '../adapters/in-memory.participation.repository';
import { InMemoryUserRepository } from 'src/users/adapters/in-memory.user.repository';
import { InMemoryMailer } from 'src/core/adapters/in-memory.mailer';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found.exception';
import { ParticipationNotFoundException } from '../exceptions/participation-not-found.exception';

describe('Feature: cancelling a seat', () => {
  let webinarRepository: InMemoryWebinarRepository;
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;
  let mailer: InMemoryMailer;

  let usecase: CancelSeatUseCase;
  const webinar = new Webinar({
    id: 'id-1',
    organizerId: 'alice',
    title: 'My first webinar',
    seats: 50,
    startDate: new Date('2024-01-20T10:00:00.000Z'),
    endDate: new Date('2024-01-21T10:00:00.000Z'),
  });
  const bobParticipation = new Participation({
    userId: testUsers.bob.props.id,
    webinarId: webinar.props.id,
  });

  function exceptParticipationNotToBeDelete() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinar.props.id,
    );
    expect(storedParticipation).not.toBeNull();
  }

  function exceptParticipationToBeDeleted() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinar.props.id,
    );
    expect(storedParticipation).toBeNull();
  }
  beforeEach(async () => {
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    participationRepository = new InMemoryParticipationRepository([
      bobParticipation,
    ]);
    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
    ]);
    mailer = new InMemoryMailer();
    usecase = new CancelSeatUseCase(
      webinarRepository,
      participationRepository,
      userRepository,
      mailer,
    );
  });
  describe('Scenario: happy path', () => {
    const payload = {
      user: testUsers.bob,
      webinarId: webinar.props.id,
    };
    test('Succed to cancel a seat', async () => {
      await usecase.execute(payload);

      exceptParticipationToBeDeleted();
    });

    test('should send an email to the organzer', async () => {
      await usecase.execute(payload);

      expect(mailer.sentEmails[0]).toEqual({
        to: testUsers.alice.props.emailAddress,
        subject: 'A participant has cancelled his seat',
        body: `A participant has cancelled his seat for the webinar "${webinar.props.title}"`,
      });
    });

    test('should send an email to the participant', async () => {
      await usecase.execute(payload);

      expect(mailer.sentEmails[1]).toEqual({
        to: payload.user.props.emailAddress,
        subject: 'Your participation cancellation',
        body: `You have cancelled your participation for the webinar "${webinar.props.title}"`,
      });
    });
  });

  describe('Scenario: the webinar does not exist', () => {
    const payload = {
      user: testUsers.bob,
      webinarId: 'random-id',
    };
    test('should fail', async () => {
      await expect(() => usecase.execute(payload)).rejects.toThrowError(
        WebinarNotFoundException,
      );
      exceptParticipationNotToBeDelete();
    });
  });

  describe('Scenario: the user did not reserve a seat', () => {
    const payload = {
      user: testUsers.charles,
      webinarId: webinar.props.id,
    };
    test('should fail', async () => {
      await expect(() => usecase.execute(payload)).rejects.toThrowError(
        ParticipationNotFoundException,
      );

      exceptParticipationNotToBeDelete();
    });
  });
});
