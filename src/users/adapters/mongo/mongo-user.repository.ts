import { User } from 'src/users/entities/user.entity';
import { IUserRepository } from 'src/users/ports/user.repository';
import { MongoUser } from './mongo-user';
import { Model } from 'mongoose';

export class MongoUserRepository implements IUserRepository {
  private mapper = new UserMapper();
  constructor(private readonly model: Model<MongoUser.SchemaClass>) {}
  async create(user: User): Promise<void> {
    const record = new this.model(this.mapper.toPersistence(user));
    await record.save();
  }
  async findByEmailAddress(emailAddress: string): Promise<User> {
    const user = await this.model.findOne({ emailAddress });

    if (!user) {
      return null;
    }
    return this.mapper.toCore(user);
  }
  async findById(userId: string): Promise<User> {
    const user = await this.model.findById(userId);

    if (!user) {
      return null;
    }
    return this.mapper.toCore(user);
  }
}

class UserMapper {
  toCore(user: MongoUser.Document): User {
    return new User({
      id: user._id,
      emailAddress: user.emailAddress,
      password: user.password,
    });
  }
  toPersistence(user: User): MongoUser.SchemaClass {
    return {
      _id: user.props.id,
      emailAddress: user.props.emailAddress,
      password: user.props.password,
    };
  }
}
