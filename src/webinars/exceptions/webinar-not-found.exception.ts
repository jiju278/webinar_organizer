import { DomainException } from 'src/shared/exception';

export class WebinarNotFoundException extends DomainException {
  constructor() {
    super('The Webinar does not exist');
  }
}
