import { DomainException } from 'src/shared/exception';

export class WebinarUpdateForbiddenException extends DomainException {
  constructor() {
    super('You are not allowed to update the webinar');
  }
}
