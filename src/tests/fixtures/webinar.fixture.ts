import { Webinar } from './../../webinars/entites/webinar.entity';
import { IFixture } from '../utils/fixture';
import { TestApp } from '../utils/test-app';
import {
  IWebinarRepository,
  I_WEBINAR_REPOSITORY,
} from 'src/webinars/ports/webinar.repository.interface';

export class WebinarFixture implements IFixture {
  constructor(public readonly entity: Webinar) {}
  async load(app: TestApp): Promise<void> {
    const webinarRepository = app.get<IWebinarRepository>(I_WEBINAR_REPOSITORY);
    await webinarRepository.create(this.entity);
  }
}
