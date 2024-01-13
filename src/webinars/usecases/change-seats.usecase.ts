import { User } from 'src/users/entities/user.entity';
import { IWebinarRepository } from '../ports/webinar.repository.interface';
import { Executable } from 'src/shared/executable';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found.exception';
import { WebinarUpdateForbiddenException } from '../exceptions/webinar-update-forbidden.exception';
import { DomainException } from 'src/shared/exception';
import { WebinarTooManySeatsException } from '../exceptions/webinar-too-many-seats.exception';

type Request = {
  user: User;
  webinarId: string;
  seats: number;
};

type Response = void;

export class ChangeSeatsUseCase implements Executable<Request, Response> {
  constructor(private readonly webinarRepository: IWebinarRepository) {}
  async execute({ user, webinarId, seats }: Request): Promise<Response> {
    const webinar = await this.webinarRepository.findById(webinarId);
    if (webinar === null) {
      throw new WebinarNotFoundException();
    }

    if (webinar.isOrganizer(user) === false) {
      throw new WebinarUpdateForbiddenException();
    }

    if (seats < webinar.props.seats) {
      throw new DomainException('Reducing the number of seats is impossible');
    }
    webinar.update({ seats });

    if (webinar.hasTooManySeats()) {
      throw new WebinarTooManySeatsException();
    }

    await this.webinarRepository.update(webinar);
  }
}
