import { IWebinarRepository } from 'src/webinars/ports/webinar.repository.interface';
import { Webinar } from '../entites/webinar.entity';

export class InMemoryWebinarRepository implements IWebinarRepository {
  public database: Webinar[] = [];
  async findById(id: string): Promise<Webinar> {
    const webinar = this.database.find((webinar) => webinar.props.id === id);
    return webinar ?? null;
  }
  async create(webinar: Webinar): Promise<void> {
    this.database.push(webinar);
  }
}
