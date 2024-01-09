import { differenceInDays } from 'date-fns';

type WebinarProps = {
  id: string;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};
export class Webinar {
  constructor(public props: WebinarProps) {}

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
}
