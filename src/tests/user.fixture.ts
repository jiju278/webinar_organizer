import { User } from 'src/entities/user.entity';
import { IFixture } from './fixture';
import { TestApp } from './test-app';
import { IUserRepository, I_USER_REPOSITORY } from 'src/ports/user.repository';

export class UserFixture implements IFixture {
  constructor(public readonly entity: User) {}
  async load(app: TestApp): Promise<void> {
    const userRepository = app.get<IUserRepository>(I_USER_REPOSITORY);
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
