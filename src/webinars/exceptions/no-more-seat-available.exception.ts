import { DomainException } from 'src/shared/exception';

export class NoMoreSeatAvailableException extends DomainException {
  constructor() {
    super('No more seat available');
  }
}
