import { IIDGenerator } from 'src/ports/id-generator.interface';
import { v4 as uuidv4 } from 'uuid';

export class UuidGenerator implements IIDGenerator {
  generate(): string {
    return uuidv4();
  }
}
