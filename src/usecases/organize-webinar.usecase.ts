import { Webinar } from 'src/entities/webinar.entity';
import { IIDGenerator } from 'src/ports/id-generator.interface';
import { IWebinarRepository } from 'src/ports/webinar.repository.interface';

export class OrganizeWebinarUseCase {
  constructor(
    private readonly webinarRepository: IWebinarRepository,
    private readonly idGenerator: IIDGenerator,
  ) {}
  async execute(data: {
    title: string;
    seats: number;
    startDate: Date;
    endDate: Date;
  }): Promise<{ id: string }> {
    const id = this.idGenerator.generate();
    await this.webinarRepository.create(
      new Webinar({
        id,
        title: data.title,
        seats: data.seats,
        startDate: data.startDate,
        endDate: data.endDate,
      }),
    );

    return { id };
  }
}
