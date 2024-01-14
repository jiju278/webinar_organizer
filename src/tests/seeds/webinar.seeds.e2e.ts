import { addDays } from 'date-fns';
import { e2eUsers } from './user.seeds.e2e';
import { Webinar } from 'src/webinars/entities/webinar.entity';
import { WebinarFixture } from '../fixtures/webinar.fixture';

export const e2eWebinars = {
  webinar1: new WebinarFixture(
    new Webinar({
      id: 'id-1',
      organizerId: e2eUsers.johnDoe.entity.props.id,
      seats: 50,
      title: 'My first webinar',
      startDate: addDays(new Date(), 4),
      endDate: addDays(new Date(), 5),
    }),
  ),
};
