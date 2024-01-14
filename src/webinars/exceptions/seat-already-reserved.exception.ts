import { DomainException } from 'src/shared/exception';

export class SeatAlreadyReservedException extends DomainException {
  constructor() {
    super('You already participate to this webinar');
  }
}
