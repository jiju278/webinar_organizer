import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { IWebinarRepository } from '../ports/webinar.repository.interface';
import { IDateGenerator } from 'src/core/ports/date-generator.interface';
import { IParticipationRepository } from '../ports/participation.repository.interface';
import { IMailer } from 'src/core/ports/mailer.interface';
import { IUserRepository } from 'src/users/ports/user.repository';
import { Webinar } from '../entities/webinar.entity';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found.exception';
import { WebinarUpdateForbiddenException } from '../exceptions/webinar-update-forbidden.exception';
import { WebinarTooEarlyException } from '../exceptions/webinar-too-early.exception';

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
  async execute({
    user,
    webinarId,
    startDate,
    endDate,
  }: Request): Promise<void> {
    const webinar = await this.webinarRepository.findById(webinarId);

    if (webinar === null) {
      throw new WebinarNotFoundException();
    }

    if (webinar.props.organizerId !== user.props.id) {
      throw new WebinarUpdateForbiddenException();
    }

    webinar.update({ startDate, endDate });

    if (webinar.isTooClose(this.dateProvider.now())) {
      throw new WebinarTooEarlyException();
    }
    await this.webinarRepository.update(webinar);

    await this.sendEmailToParticipants(webinar);
  }

  private async sendEmailToParticipants(webinar: Webinar): Promise<void> {
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
