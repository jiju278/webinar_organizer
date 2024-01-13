import { User } from 'src/users/entities/user.entity';
import { Executable } from './../../shared/executable';
import { IWebinarRepository } from '../ports/webinar.repository.interface';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found.exception';
import { WebinarUpdateForbiddenException } from '../exceptions/webinar-update-forbidden.exception';
import { IMailer } from 'src/core/ports/mailer.interface';
import { IParticipationRepository } from '../ports/participation.repository.interface';
import { IUserRepository } from 'src/users/ports/user.repository';
import { Webinar } from '../entities/webinar.entity';

type Request = {
  user: User;
  webinarId: string;
};

type Response = void;
export class CancelWebinarUseCase implements Executable<Request, Response> {
  constructor(
    private readonly webinarRepository: IWebinarRepository,
    private readonly mailer: IMailer,
    private readonly participationRepository: IParticipationRepository,
    private readonly userRepository: IUserRepository,
  ) {}
  async execute({ user, webinarId }: Request): Promise<Response> {
    const webinar = await this.webinarRepository.findById(webinarId);

    if (webinar === null) {
      throw new WebinarNotFoundException();
    }

    if (webinar.isOrganizer(user) === false) {
      throw new WebinarUpdateForbiddenException();
    }
    await this.webinarRepository.delete(webinar);

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
          subject: 'Webinar cancelled',
          body: `The webinar "${webinar.props.title}" has been cancelled`,
        }),
      ),
    );
  }
}
