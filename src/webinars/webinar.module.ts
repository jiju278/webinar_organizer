import { Module } from '@nestjs/common';
import { I_WEBINAR_REPOSITORY } from './ports/webinar.repository.interface';
import { InMemoryWebinarRepository } from './adapters/in-memory.webinar.repository';
import { OrganizeWebinarUseCase } from './usecases/organize-webinar.usecase';
import { I_ID_GENERATOR } from 'src/core/ports/id-generator.interface';
import { I_DATE_GENERATOR } from 'src/core/ports/date-generator.interface';
import { WebinarController } from './controllers/webinar.controller';
import { CommonModule } from 'src/core/common.module';
import { ChangeSeatsUseCase } from './usecases/change-seats.usecase';

@Module({
  imports: [CommonModule],
  controllers: [WebinarController],
  providers: [
    {
      provide: I_WEBINAR_REPOSITORY,
      useClass: InMemoryWebinarRepository,
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
      provide: ChangeSeatsUseCase,
      inject: [I_WEBINAR_REPOSITORY],
      useFactory: (repository) => {
        return new ChangeSeatsUseCase(repository);
      },
    },
  ],
  exports: [I_WEBINAR_REPOSITORY],
})
export class WebinarModule {}
