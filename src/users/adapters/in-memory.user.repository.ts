import { User } from '../entities/user.entity';
import { IUserRepository } from '../ports/user.repository';

export class InMemoryUserRepository implements IUserRepository {
  constructor(public database: User[] = []) {}

  async create(user: User): Promise<void> {
    this.database.push(user);
  }

  async findByEmailAddress(emailAddress: string): Promise<User | null> {
    const user = this.database.find(
      (user) => user.props.emailAddress === emailAddress,
    );

    return user ?? null;
  }
  async findById(userId: string): Promise<User | null> {
    const user = this.database.find((user) => user.props.id === userId);
    return user ?? null;
  }
}
