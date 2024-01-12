import { User } from 'src/users/entities/user.entity';
import { IWebinarRepository } from '../ports/webinar.repository.interface';
import { Executable } from 'src/shared/executable';

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
      throw new Error('Webinar does not exist');
    }

    if (webinar.props.organizerId !== user.props.id) {
      throw new Error('You are not allowed to update the webinar');
    }

    if (seats < webinar.props.seats) {
      throw new Error('Reducing the number of seats is impossible');
    }
    webinar.update({ seats });

    if (webinar.hasTooManySeats()) {
      throw new Error('The webinar must have a maximum of 1000 seats');
    }

    await this.webinarRepository.update(webinar);
  }
}
