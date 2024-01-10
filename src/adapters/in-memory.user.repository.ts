import { User } from 'src/entities/user.entity';
import { IUserRepository } from 'src/ports/user.repository';

export class InMemoryUserRepository implements IUserRepository {
  private database: User[] = [];

  async create(user: User): Promise<void> {
    this.database.push(user);
  }

  async findByEmailAddress(emailAddress: string): Promise<User | null> {
    const user = this.database.find(
      (user) => user.props.emailAddress === emailAddress,
    );

    return user ?? null;
  }
}
