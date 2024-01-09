import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurrentDateGenerator } from './adapters/current-date-generator';
import { UuidGenerator } from './adapters/uuid-generator';
import { InMemoryWebinarRepository } from './adapters/in-memory.webinar.repository';
import { OrganizeWebinarUseCase } from './usecases/organize-webinar.usecase';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    CurrentDateGenerator,
    UuidGenerator,
    InMemoryWebinarRepository,
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
  ],
})
export class AppModule {}
