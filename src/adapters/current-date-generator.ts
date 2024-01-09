import { IDateGenerator } from 'src/ports/date-generator.interface';

export class CurrentDateGenerator implements IDateGenerator {
  now(): Date {
    return new Date();
  }
}
