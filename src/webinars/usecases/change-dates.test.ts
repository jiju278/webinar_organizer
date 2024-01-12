import { testUsers } from 'src/users/tests/user.seeds';
import { ChangeDatesUseCase } from './change-dates.usecase';
import { Webinar } from '../entities/webinar.entity';
import { InMemoryWebinarRepository } from '../adapters/in-memory.webinar.repository';
import { FixedDateGenerator } from 'src/core/adapters/fixed-date-generator';
import { Participation } from '../entities/participation.entity';
import { InMemoryParticipationRepository } from '../adapters/in-memory.participation.repository';
import { InMemoryMailer } from 'src/core/adapters/in-memory.mailer';
import { InMemoryUserRepository } from 'src/users/adapters/in-memory.user.repository';

describe('Feature: Changing the dates', () => {
  let webinarRepository: InMemoryWebinarRepository;
  let dateGenerator: FixedDateGenerator;
  let usecase: ChangeDatesUseCase;
  let mailer: InMemoryMailer;
  let userRepository: InMemoryUserRepository;

  const webinar = new Webinar({
    id: 'id-1',
    organizerId: 'alice',
    title: 'My first webinar',
    seats: 50,
    startDate: new Date('2024-01-20T10:00:00.000Z'),
    endDate: new Date('2024-01-21T10:00:00.000Z'),
  });
  let participationRepository: InMemoryParticipationRepository;
  const bobParticipation = new Participation({
    userId: testUsers.bob.props.id,
    webinarId: webinar.props.id,
  });

  function expectDatesToRemainUnchanged() {
    const updatedWebinar = webinarRepository.findByIdSync('id-1');
    expect(updatedWebinar.props.startDate).toEqual(webinar.props.startDate);
    expect(updatedWebinar.props.endDate).toEqual(webinar.props.endDate);
  }
  beforeEach(async () => {
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    dateGenerator = new FixedDateGenerator();
    participationRepository = new InMemoryParticipationRepository([
      bobParticipation,
    ]);
    mailer = new InMemoryMailer();
    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
    ]);

    usecase = new ChangeDatesUseCase(
      webinarRepository,
      dateGenerator,
      participationRepository,
      mailer,
      userRepository,
    );
  });
  describe('Scenario: Happy path', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: 'id-1',
      startDate: new Date('2024-01-22T10:00:00.000Z'),
      endDate: new Date('2024-01-23T10:00:00.000Z'),
    };

    it('should change the date', async () => {
      await usecase.execute(payload);

      const updateWebinar = webinarRepository.findByIdSync('id-1');
      expect(updateWebinar.props.startDate).toEqual(payload.startDate);
      expect(updateWebinar.props.endDate).toEqual(payload.endDate);
    });

    it('should send an e-mail to the participants', async () => {
      await usecase.execute(payload);
      expect(mailer.sentEmails).toEqual([
        {
          to: testUsers.bob.props.emailAddress,
          subject: 'Dates changed',
          body: 'The dates of the "My first webinar" webinar have changed.',
        },
      ]);
    });
  });

  describe('Scenario: The webinar does not exist', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: 'id-x',
      startDate: new Date('2024-01-22T10:00:00.000Z'),
      endDate: new Date('2024-01-23T10:00:00.000Z'),
    };

    it('updating should fail', async () => {
      await expect(() => usecase.execute(payload)).rejects.toThrow(
        'The Webinar does not exist',
      );
    });
  });

  describe('Scenario: The webinar does not belong to the user', () => {
    const payload = {
      user: testUsers.bob,
      webinarId: 'id-1',
      startDate: new Date('2024-01-22T10:00:00.000Z'),
      endDate: new Date('2024-01-23T10:00:00.000Z'),
    };

    it('updating should fail', async () => {
      await expect(() => usecase.execute(payload)).rejects.toThrow(
        'The webinar cannot be updated by someone else',
      );
      expectDatesToRemainUnchanged();
    });
  });

  describe('Scenario: The dates are too close', () => {
    // Have a look at the date in FixedDateGenerator
    const payload = {
      user: testUsers.alice,
      webinarId: 'id-1',
      startDate: new Date('2024-01-02T10:00:00.000Z'),
      endDate: new Date('2024-01-03:00:00.000Z'),
    };

    it('updating should fail', async () => {
      await expect(() => usecase.execute(payload)).rejects.toThrow(
        'The webinar must happen in at least 3 days before',
      );
      expectDatesToRemainUnchanged();
    });
  });
});
