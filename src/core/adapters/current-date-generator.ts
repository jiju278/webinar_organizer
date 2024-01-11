import { IDateGenerator } from 'src/core/ports/date-generator.interface';

export class CurrentDateGenerator implements IDateGenerator {
  now(): Date {
    return new Date();
  }
}
