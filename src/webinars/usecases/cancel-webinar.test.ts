import { testUsers } from 'src/users/tests/user.seeds';
import { CancelWebinarUseCase } from './cancel-webinar.usecase';
import { Webinar } from '../entities/webinar.entity';
import { InMemoryWebinarRepository } from '../adapters/in-memory.webinar.repository';
import { WebinarUpdateForbiddenException } from '../exceptions/webinar-update-forbidden.exception';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found.exception';
import { InMemoryMailer } from 'src/core/adapters/in-memory.mailer';
import { Participation } from '../entities/participation.entity';
import { InMemoryParticipationRepository } from '../adapters/in-memory.participation.repository';
import { InMemoryUserRepository } from 'src/users/adapters/in-memory.user.repository';

describe('Feature: canceling a webinar', () => {
  let usecase: CancelWebinarUseCase;
  let webinarRepository: InMemoryWebinarRepository;
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;
  let mailer: InMemoryMailer;

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

  function expectedWebinarToBeDeleted() {
    const deletedWebinar = webinarRepository.findByIdSync(webinar.props.id);
    expect(deletedWebinar).toBeNull();
  }

  function expectedWebinarNotToBeDeleted() {
    const storedWebinar = webinarRepository.findByIdSync(webinar.props.id);
    expect(storedWebinar).not.toBeNull();
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
    usecase = new CancelWebinarUseCase(
      webinarRepository,
      mailer,
      participationRepository,
      userRepository,
    );
  });
  describe('Scenario: happy path', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: webinar.props.id,
    };
    test('The webinar must be deleted', async () => {
      await usecase.execute(payload);
      expectedWebinarToBeDeleted();
    });

    test('send email to participants', async () => {
      await usecase.execute(payload);
      expect(mailer.sentEmails).toEqual([
        {
          to: testUsers.bob.props.emailAddress,
          subject: 'Webinar cancelled',
          body: `The webinar "${webinar.props.title}" has been cancelled`,
        },
      ]);
    });
  });

  describe('Scenario: webinar not found', () => {
    test('Delete operation should fail', async () => {
      await expect(() =>
        usecase.execute({
          user: testUsers.alice,
          webinarId: 'id-2',
        }),
      ).rejects.toThrowError(WebinarNotFoundException);

      expectedWebinarNotToBeDeleted();
    });
  });

  describe('Scenario: deleting the webinar of someone else', () => {
    test('Delete operation should fail', async () => {
      await expect(() =>
        usecase.execute({
          user: testUsers.bob,
          webinarId: webinar.props.id,
        }),
      ).rejects.toThrowError(WebinarUpdateForbiddenException);

      expectedWebinarNotToBeDeleted();
    });
  });
});
