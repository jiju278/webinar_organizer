import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { IParticipationRepository } from '../ports/participation.repository.interface';
import { Participation } from '../entities/participation.entity';
import { IMailer } from 'src/core/ports/mailer.interface';
import { IWebinarRepository } from '../ports/webinar.repository.interface';
import { IUserRepository } from 'src/users/ports/user.repository';
import { Webinar } from '../entities/webinar.entity';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found.exception';
import { NoMoreSeatAvailableException } from '../exceptions/no-more-seat-available.exception';
import { SeatAlreadyReservedException } from '../exceptions/seat-already-reserved.exception';

type Request = {
  user: User;
  webinarId: string;
};

type Response = void;

export class ReserveSeatUseCase implements Executable<Request, Response> {
  constructor(
    private readonly participationRepository: IParticipationRepository,
    private readonly mailer: IMailer,
    private readonly webinarRepository: IWebinarRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ user, webinarId }: Request): Promise<Response> {
    const webinar = await this.webinarRepository.findById(webinarId);
    if (webinar === null) {
      throw new WebinarNotFoundException();
    }

    await this.assertUserIsNotAlreadyParticipating(user, webinar);
    await this.assertWebinarHasEnoughSeats(webinar);

    const participation = new Participation({
      userId: user.props.id,
      webinarId: webinarId,
    });
    await this.participationRepository.create(participation);
    await this.sendEmailToOrganizer(webinar);
    await this.sendEmailToParticipant(webinar, user);
  }

  private async sendEmailToOrganizer(webinar: Webinar): Promise<void> {
    const organizer = await this.userRepository.findById(
      webinar.props.organizerId,
    );

    await this.mailer.send({
      to: organizer.props.emailAddress,
      subject: 'New participation',
      body: `A new user has reserved a seat for your webinar "${webinar.props.title}"`,
    });
  }

  private async sendEmailToParticipant(
    webinar: Webinar,
    user: User,
  ): Promise<void> {
    await this.mailer.send({
      to: user.props.emailAddress,
      subject: 'Your participation to a webinar',
      body: `You have reserved a seat for the webinar "${webinar.props.title}"`,
    });
  }

  private async assertUserIsNotAlreadyParticipating(
    user: User,
    webinar: Webinar,
  ) {
    const existingParticipation = await this.participationRepository.findOne(
      user.props.id,
      webinar.props.id,
    );

    if (existingParticipation !== null) {
      throw new SeatAlreadyReservedException();
    }
  }

  private async assertWebinarHasEnoughSeats(webinar: Webinar) {
    const participationCount =
      await this.participationRepository.findParticipationCount(
        webinar.props.id,
      );

    if (participationCount >= webinar.props.seats) {
      throw new NoMoreSeatAvailableException();
    }
  }
}
