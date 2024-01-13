import { Module } from '@nestjs/common';
import { I_WEBINAR_REPOSITORY } from './ports/webinar.repository.interface';
import { InMemoryWebinarRepository } from './adapters/in-memory.webinar.repository';
import { OrganizeWebinarUseCase } from './usecases/organize-webinar.usecase';
import { I_ID_GENERATOR } from 'src/core/ports/id-generator.interface';
import { I_DATE_GENERATOR } from 'src/core/ports/date-generator.interface';
import { WebinarController } from './controllers/webinar.controller';
import { CommonModule } from 'src/core/common.module';
import { ChangeSeatsUseCase } from './usecases/change-seats.usecase';
import { I_PARTICIPATION_REPOSITORY } from './ports/participation.repository.interface';
import { InMemoryParticipationRepository } from './adapters/in-memory.participation.repository';
import { ChangeDatesUseCase } from './usecases/change-dates.usecase';
import { I_USER_REPOSITORY } from 'src/users/ports/user.repository';
import { I_MAILER } from 'src/core/ports/mailer.interface';
import { UserModule } from 'src/users/user.module';

@Module({
  imports: [CommonModule, UserModule],
  controllers: [WebinarController],
  providers: [
    {
      provide: I_WEBINAR_REPOSITORY,
      useClass: InMemoryWebinarRepository,
    },
    {
      provide: I_PARTICIPATION_REPOSITORY,
      useClass: InMemoryParticipationRepository,
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
    {
      provide: ChangeDatesUseCase,
      inject: [
        I_WEBINAR_REPOSITORY,
        I_DATE_GENERATOR,
        I_PARTICIPATION_REPOSITORY,
        I_MAILER,
        I_USER_REPOSITORY,
      ],
      useFactory: (
        webinarRepository,
        dateGenerator,
        participationRepository,
        mailer,
        userRepository,
      ) => {
        return new ChangeDatesUseCase(
          webinarRepository,
          dateGenerator,
          participationRepository,
          mailer,
          userRepository,
        );
      },
    },
  ],
  exports: [I_WEBINAR_REPOSITORY, I_PARTICIPATION_REPOSITORY],
})
export class WebinarModule {}
