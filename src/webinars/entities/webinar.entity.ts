import { differenceInDays } from 'date-fns';
import { Entity } from 'src/shared/entity';
import { User } from 'src/users/entities/user.entity';

type WebinarProps = {
  id: string;
  organizerId: string;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};
export class Webinar extends Entity<WebinarProps> {
  isTooClose(now: Date): boolean {
    const diff = differenceInDays(this.props.startDate, now);
    return diff < 3;
  }

  hasTooManySeats(): boolean {
    return this.props.seats > 1000;
  }

  hasNoSeat(): boolean {
    return this.props.seats < 1;
  }

  isOrganizer(user: User): boolean {
    return this.props.organizerId === user.props.id;
  }
}
