import { Webinar } from 'src/entities/webinar.entity';
import { User } from 'src/entities/user.entity';
import { IDateGenerator } from 'src/ports/date-generator.interface';
import { IIDGenerator } from 'src/ports/id-generator.interface';
import { IWebinarRepository } from 'src/ports/webinar.repository.interface';

export class OrganizeWebinarUseCase {
  constructor(
    private readonly webinarRepository: IWebinarRepository,
    private readonly idGenerator: IIDGenerator,
    private readonly dateGenerator: IDateGenerator,
  ) {}
  async execute(data: {
    user: User;
    title: string;
    seats: number;
    startDate: Date;
    endDate: Date;
  }): Promise<{ id: string }> {
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
      throw new Error('The webinar must happen in at least 3 days before');
    }

    if (webinar.hasTooManySeats()) {
      throw new Error('The webinar must have a maximum of 1000 seats');
    }

    if (webinar.hasNoSeat()) {
      throw new Error('The webinar must have at least 1 seat');
    }
    await this.webinarRepository.create(webinar);

    return { id };
  }
}
