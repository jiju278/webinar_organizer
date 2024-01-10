import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurrentDateGenerator } from './adapters/current-date-generator';
import { UuidGenerator } from './adapters/uuid-generator';
import { InMemoryWebinarRepository } from './adapters/in-memory.webinar.repository';
import { OrganizeWebinarUseCase } from './usecases/organize-webinar.usecase';
import { InMemoryUserRepository } from './adapters/in-memory.user.repository';
import { Authenticator } from './services/authenticator';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    CurrentDateGenerator,
    UuidGenerator,
    InMemoryWebinarRepository,
    InMemoryUserRepository,
    {
      provide: OrganizeWebinarUseCase,
      inject: [InMemoryWebinarRepository, UuidGenerator, CurrentDateGenerator],
      useFactory: (repository, idGenerator, dateGenerator) => {
        return new OrganizeWebinarUseCase(
          repository,
          idGenerator,
          dateGenerator,
        );
      },
    },
    {
      provide: Authenticator,
      inject: [InMemoryUserRepository],
      useFactory: (repository) => {
        return new Authenticator(repository);
      },
    },
    {
      provide: APP_GUARD,
      inject: [Authenticator],
      useFactory: (authenticator) => {
        return new AuthGuard(authenticator);
      },
    },
  ],
})
export class AppModule {}
