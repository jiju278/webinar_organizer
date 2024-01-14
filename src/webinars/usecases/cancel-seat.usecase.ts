import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { IWebinarRepository } from '../ports/webinar.repository.interface';
import { IUserRepository } from 'src/users/ports/user.repository';
import { IParticipationRepository } from '../ports/participation.repository.interface';
import { IMailer } from 'src/core/ports/mailer.interface';
import { Webinar } from '../entities/webinar.entity';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found.exception';
import { ParticipationNotFoundException } from '../exceptions/participation-not-found.exception';

type Request = {
  user: User;
  webinarId: string;
};

type Response = void;

export class CancelSeatUseCase implements Executable<Request, Response> {
  constructor(
    private readonly webinarRepository: IWebinarRepository,
    private readonly participationRepository: IParticipationRepository,
    private readonly userRepository: IUserRepository,
    private readonly mailer: IMailer,
  ) {}
  async execute({ user, webinarId }: Request): Promise<void> {
    const webinar = await this.webinarRepository.findById(webinarId);
    if (webinar === null) {
      throw new WebinarNotFoundException();
    }

    const participation = await this.participationRepository.findOne(
      user.props.id,
      webinarId,
    );

    if (participation === null) {
      throw new ParticipationNotFoundException();
    }
    await this.participationRepository.delete(participation);

    await this.sendEmailToOrganizer(webinar);
    await this.sendEmailToParticipant(webinar, user);
  }

  private async sendEmailToOrganizer(webinar: Webinar): Promise<void> {
    const organizer = await this.userRepository.findById(
      webinar.props.organizerId,
    );

    await this.mailer.send({
      to: organizer.props.emailAddress,
      subject: 'A participant has cancelled his seat',
      body: `A participant has cancelled his seat for the webinar "${webinar.props.title}"`,
    });
  }

  private async sendEmailToParticipant(
    webinar: Webinar,
    user: User,
  ): Promise<void> {
    await this.mailer.send({
      to: user.props.emailAddress,
      subject: 'Your participation cancellation',
      body: `You have cancelled your participation for the webinar "${webinar.props.title}"`,
    });
  }
}
