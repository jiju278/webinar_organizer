import { User } from 'src/entities/user.entity';
import { IFixture } from './fixture';
import { TestApp } from './test-app';
import { IUserRepository } from 'src/ports/user.repository';
import { InMemoryUserRepository } from 'src/adapters/in-memory.user.repository';

export class UserFixture implements IFixture {
  constructor(public readonly entity: User) {}
  async load(app: TestApp): Promise<void> {
    const userRepository = app.get<IUserRepository>(InMemoryUserRepository);
    await userRepository.create(this.entity);
  }
  createAuthorizationToken() {
    return (
      'Basic ' +
      Buffer.from(
        `${this.entity.props.emailAddress}:${this.entity.props.password}`,
      ).toString('base64')
    );
  }
}
