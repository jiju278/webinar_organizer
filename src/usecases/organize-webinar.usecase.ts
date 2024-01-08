type WebinarProps = {
  id: string;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};
export class Webinar {
  constructor(public props: WebinarProps) {}
}

export interface IWebinarRepository {
  create(webinar: Webinar): Promise<void>;
}

export interface IIDGenerator {
  generate(): string;
}

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
