import { IDateGenerator } from 'src/core/ports/date-generator.interface';
import { IIDGenerator } from 'src/core/ports/id-generator.interface';
import { IWebinarRepository } from 'src/webinars/ports/webinar.repository.interface';
import { Webinar } from '../entities/webinar.entity';
import { User } from 'src/users/entities/user.entity';
import { Executable } from 'src/shared/executable';
import { WebinarTooEarlyException } from '../exceptions/webinar-too-early.exception';
import { WebinarTooManySeatsException } from '../exceptions/webinar-too-many-seats.exception';
import { WebinarNotEnoughSeatsException } from '../exceptions/webinar-not-enough-seats.exception';

type Request = {
  user: User;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};

type Response = {
  id: string;
};
export class OrganizeWebinarUseCase implements Executable<Request, Response> {
  constructor(
    private readonly webinarRepository: IWebinarRepository,
    private readonly idGenerator: IIDGenerator,
    private readonly dateGenerator: IDateGenerator,
  ) {}
  async execute(data: Request): Promise<Response> {
    const id = this.idGenerator.generate();
    const webinar = new Webinar({
      id,
      organizerId: data.user.props.id,
      title: data.title,
      seats: data.seats,
      startDate: data.startDate,
      endDate: data.endDate,
    });

    if (webinar.isTooClose(this.dateGenerator.now())) {
      throw new WebinarTooEarlyException();
    }

    if (webinar.hasTooManySeats()) {
      throw new WebinarTooManySeatsException();
    }

    if (webinar.hasNoSeat()) {
      throw new WebinarNotEnoughSeatsException();
    }
    await this.webinarRepository.create(webinar);

    return { id };
  }
}
