import { InMemoryUserRepository } from 'src/adapters/in-memory.user.repository';
import { Authenticator } from './authenticator';
import { User } from 'src/entities/user.entity';

describe('Authenticator', () => {
  let repository: InMemoryUserRepository;
  let authenticator: Authenticator;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    authenticator = new Authenticator(repository);
  });

  test('Scenario: the token is valid', async () => {
    await repository.create(
      new User({
        id: 'id-1',
        emailAddress: 'johndoe@gmail.com',
        password: 'azerty',
      }),
    );
    const payload: string = Buffer.from('johndoe@gmail.com:azerty').toString(
      'base64',
    );
    const user = await authenticator.authenticate(payload);
    expect(user.props).toEqual({
      id: 'id-1',
      emailAddress: 'johndoe@gmail.com',
      password: 'azerty',
    });
  });

  test('Scenario: the user does not exist', async () => {
    await repository.create(
      new User({
        id: 'id-1',
        emailAddress: 'johndoe@gmail.com',
        password: 'azerty',
      }),
    );
    const payload: string = Buffer.from('john@gmail.com:azerty').toString(
      'base64',
    );
    await expect(() => authenticator.authenticate(payload)).rejects.toThrow(
      'User not found',
    );
  });

  test('Scenario: the password is not valid', async () => {
    await repository.create(
      new User({
        id: 'id-1',
        emailAddress: 'johndoe@gmail.com',
        password: 'azerty',
      }),
    );
    const payload: string = Buffer.from('johndoe@gmail.com:notvalid').toString(
      'base64',
    );
    await expect(() => authenticator.authenticate(payload)).rejects.toThrow(
      'Password invalid',
    );
  });
});
