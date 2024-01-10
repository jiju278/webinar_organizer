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
import { I_USER_REPOSITORY } from './ports/user.repository';
import { I_WEBINAR_REPOSITORY } from './ports/webinar.repository.interface';
import { I_ID_GENERATOR } from './ports/id-generator.interface';
import { I_DATE_GENERATOR } from './ports/date-generator.interface';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: I_DATE_GENERATOR,
      useClass: CurrentDateGenerator,
    },
    {
      provide: I_ID_GENERATOR,
      useClass: UuidGenerator,
    },
    {
      provide: I_WEBINAR_REPOSITORY,
      useClass: InMemoryWebinarRepository,
    },
    {
      provide: I_USER_REPOSITORY,
      useClass: InMemoryUserRepository,
    },
    {
      provide: OrganizeWebinarUseCase,
      inject: [I_WEBINAR_REPOSITORY, I_ID_GENERATOR, I_DATE_GENERATOR],
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
      inject: [I_USER_REPOSITORY],
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
