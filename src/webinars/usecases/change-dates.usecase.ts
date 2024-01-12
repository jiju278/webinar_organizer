import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { IWebinarRepository } from '../ports/webinar.repository.interface';
import { IDateGenerator } from 'src/core/ports/date-generator.interface';
import { IParticipationRepository } from '../ports/participation.repository.interface';
import { IMailer } from 'src/core/ports/mailer.interface';
import { IUserRepository } from 'src/users/ports/user.repository';
import { Webinar } from '../entities/webinar.entity';

type Request = {
  user: User;
  webinarId: string;
  startDate: Date;
  endDate: Date;
};

type Response = void;

export class ChangeDatesUseCase implements Executable<Request, Response> {
  constructor(
    private readonly webinarRepository: IWebinarRepository,
    private readonly dateProvider: IDateGenerator,
    private readonly participationRepository: IParticipationRepository,
    private readonly mailer: IMailer,
    private readonly userRepository: IUserRepository,
  ) {}
  async execute(request: Request): Promise<void> {
    const webinar = await this.webinarRepository.findById(request.webinarId);

    if (webinar === null) {
      throw new Error('The Webinar does not exist');
    }

    if (webinar.props.organizerId !== request.user.props.id) {
      throw new Error('The webinar cannot be updated by someone else');
    }

    webinar.update({ startDate: request.startDate, endDate: request.endDate });

    if (webinar.isTooClose(this.dateProvider.now())) {
      throw new Error('The webinar must happen in at least 3 days before');
    }
    await this.webinarRepository.update(webinar);

    await this.sendEmailToParticipants(webinar);
  }

  async sendEmailToParticipants(webinar: Webinar): Promise<void> {
    const participations = await this.participationRepository.findByWebinarId(
      webinar.props.id,
    );

    const users = await Promise.all(
      participations
        .map((participation) =>
          this.userRepository.findById(participation.props.userId),
        )
        .filter((user) => user !== null),
    );

    await Promise.all(
      users.map((user) =>
        this.mailer.send({
          to: user.props.emailAddress,
          subject: 'Dates changed',
          body: `The dates of the "${webinar.props.title}" webinar have changed.`,
        }),
      ),
    );
  }
}
