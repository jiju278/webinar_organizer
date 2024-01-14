import { Model } from 'mongoose';
import { TestApp } from 'src/tests/utils/test-app';
import { MongoUser } from './mongo-user';
import { MongoUserRepository } from './mongo-user.repository';
import { getModelToken } from '@nestjs/mongoose';
import { testUsers } from 'src/users/tests/user.seeds';
import { User } from 'src/users/entities/user.entity';

describe('MongoUserRepository', () => {
  let app: TestApp;
  let model: Model<MongoUser.SchemaClass>;
  let repository: MongoUserRepository;

  async function createUserInDatabase(user: User) {
    const record = new model({
      _id: user.props.id,
      emailAddress: user.props.emailAddress,
      password: user.props.password,
    });
    await record.save();
  }
  beforeEach(async () => {
    app = new TestApp();
    await app.setup();

    model = app.get<Model<MongoUser.SchemaClass>>(
      getModelToken(MongoUser.CollectionName),
    );

    repository = new MongoUserRepository(model);
    await createUserInDatabase(testUsers.alice);
  }, 30000 /* timeout */);

  describe('findByEmailAddress', () => {
    it('should find the user corresponding to the e-mail address', async () => {
      const user = await repository.findByEmailAddress(
        testUsers.alice.props.emailAddress,
      );
      expect(user.props).toEqual(testUsers.alice.props);
    });

    it('should fail when the email address does not exist', async () => {
      const user = await repository.findByEmailAddress('unknwon@gmail.com');
      expect(user).toBeNull;
    });
  });

  describe('findById', () => {
    it('should find the user corresponding to the e-mail address', async () => {
      const user = await repository.findById(testUsers.alice.props.id);
      expect(user.props).toEqual(testUsers.alice.props);
    });

    it('should fail when the id does not exist', async () => {
      const user = await repository.findById('id-x');
      expect(user).toBeNull;
    });
  });

  describe('create', () => {
    it('should create the user', async () => {
      await repository.create(testUsers.bob);

      const record = await model.findById(testUsers.bob.props.id);
      expect(record.toObject()).toEqual({
        __v: 0,
        _id: testUsers.bob.props.id,
        emailAddress: testUsers.bob.props.emailAddress,
        password: testUsers.bob.props.password,
      });
    });

    it('should fail when the id does not exist', async () => {
      const user = await repository.findById('id-x');
      expect(user).toBeNull;
    });
  });
  afterEach(async () => {
    await app.cleanup();
  });
});
