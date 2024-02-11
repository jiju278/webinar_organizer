import { Module } from '@nestjs/common';
import { I_WEBINAR_REPOSITORY } from './ports/webinar.repository.interface';
import { OrganizeWebinarUseCase } from './usecases/organize-webinar.usecase';
import { I_ID_GENERATOR } from 'src/core/ports/id-generator.interface';
import { I_DATE_GENERATOR } from 'src/core/ports/date-generator.interface';
import { WebinarController } from './controllers/webinar.controller';
import { CommonModule } from 'src/core/common.module';
import { ChangeSeatsUseCase } from './usecases/change-seats.usecase';
import { I_PARTICIPATION_REPOSITORY } from './ports/participation.repository.interface';
import { ChangeDatesUseCase } from './usecases/change-dates.usecase';
import { I_USER_REPOSITORY } from 'src/users/ports/user.repository';
import { I_MAILER } from 'src/core/ports/mailer.interface';
import { UserModule } from 'src/users/user.module';
import { CancelWebinarUseCase } from './usecases/cancel-webinar.usecase';
import { ParticipationController } from './controllers/participation.controller';
import { ReserveSeatUseCase } from './usecases/reserve-seats.usecase';
import { CancelSeatUseCase } from './usecases/cancel-seat.usecase';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoWebinar } from './adapters/mongo/mongo-webinar';
import { MongoWebinarRepository } from './adapters/mongo/mongo-webinar.repository';
import { MongoParticipation } from './adapters/mongo/mongo-participation';
import { MongoParticipationRepository } from './adapters/mongo/mongo-participation.repository';

@Module({
  imports: [
    CommonModule,
    UserModule,
    MongooseModule.forFeature([
      {
        name: MongoWebinar.CollectionName,
        schema: MongoWebinar.Schema,
      },
      {
        name: MongoParticipation.CollectionName,
        schema: MongoParticipation.Schema,
      },
    ]),
  ],
  controllers: [WebinarController, ParticipationController],
  providers: [
    {
      provide: I_WEBINAR_REPOSITORY,
      inject: [getModelToken(MongoWebinar.CollectionName)],
      useFactory: (model) => {
        return new MongoWebinarRepository(model);
      },
    },
    {
      provide: I_PARTICIPATION_REPOSITORY,
      inject: [getModelToken(MongoParticipation.CollectionName)],
      useFactory: (model) => {
        return new MongoParticipationRepository(model);
      },
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
    {
      provide: CancelWebinarUseCase,
      inject: [
        I_WEBINAR_REPOSITORY,
        I_MAILER,
        I_PARTICIPATION_REPOSITORY,
        I_USER_REPOSITORY,
      ],
      useFactory: (
        webinarRepository,
        mailer,
        participationRepository,
        userRepository,
      ) => {
        return new CancelWebinarUseCase(
          webinarRepository,
          mailer,
          participationRepository,
          userRepository,
        );
      },
    },
    {
      provide: ReserveSeatUseCase,
      inject: [
        I_PARTICIPATION_REPOSITORY,
        I_MAILER,
        I_WEBINAR_REPOSITORY,
        I_USER_REPOSITORY,
      ],
      useFactory: (
        participationRepository,
        mailer,
        webinarRepository,
        userRepository,
      ) => {
        return new ReserveSeatUseCase(
          participationRepository,
          mailer,
          webinarRepository,
          userRepository,
        );
      },
    },
    {
      provide: CancelSeatUseCase,
      inject: [
        I_WEBINAR_REPOSITORY,
        I_PARTICIPATION_REPOSITORY,
        I_USER_REPOSITORY,
        I_MAILER,
      ],
      useFactory: (
        webinarRepository,
        participationRepository,
        userRepository,
        mailer,
      ) => {
        return new CancelSeatUseCase(
          webinarRepository,
          participationRepository,
          userRepository,
          mailer,
        );
      },
    },
  ],
  exports: [I_WEBINAR_REPOSITORY, I_PARTICIPATION_REPOSITORY],
})
export class WebinarModule {}
