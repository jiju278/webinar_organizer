import { DomainException } from 'src/shared/exception';

export class WebinarTooManySeatsException extends DomainException {
  constructor() {
    super('The webinar must have a maximum of 1000 seats');
  }
}
