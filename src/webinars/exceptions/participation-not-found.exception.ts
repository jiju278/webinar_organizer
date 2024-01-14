import { DomainException } from 'src/shared/exception';

export class ParticipationNotFoundException extends DomainException {
  constructor() {
    super('Participation not found');
  }
}
