import { Module } from '@nestjs/common';
import { I_USER_REPOSITORY } from './ports/user.repository';
import { InMemoryUserRepository } from './adapters/in-memory.user.repository';

@Module({
  providers: [
    {
      provide: I_USER_REPOSITORY,
      useClass: InMemoryUserRepository,
    },
  ],
  exports: [I_USER_REPOSITORY],
})
export class UserModule {}
