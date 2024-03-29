import { IWebinarRepository } from 'src/webinars/ports/webinar.repository.interface';
import { Webinar } from '../entities/webinar.entity';

export class InMemoryWebinarRepository implements IWebinarRepository {
  constructor(public readonly database: Webinar[] = []) {}

  async findById(id: string): Promise<Webinar> {
    return this.findByIdSync(id);
  }
  async create(webinar: Webinar): Promise<void> {
    this.database.push(webinar);
  }
  async update(webinar: Webinar): Promise<void> {
    const index = this.database.findIndex(
      (w) => w.props.id === webinar.props.id,
    );
    this.database[index] = webinar;
    webinar.commit();
  }

  findByIdSync(id: string): Webinar | null {
    const webinar = this.database.find((webinar) => webinar.props.id === id);
    return webinar ? new Webinar({ ...webinar.initialState }) : null;
  }

  async delete(webinar: Webinar): Promise<void> {
    const findIndex = this.database.findIndex(
      (w) => w.props.id === webinar.props.id,
    );

    this.database.splice(findIndex, 1);
  }
}
