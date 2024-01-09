import { IDateGenerator } from 'src/ports/date-generator.interface';

export class FixedDateGenerator implements IDateGenerator {
  now(): Date {
    return new Date('2024-01-01T10:00:00.000Z');
  }
}
