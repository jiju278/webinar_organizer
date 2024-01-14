import { Controller, Param, Post, Request } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { WebinarAPI } from '../contract';
import { ReserveSeatUseCase } from '../usecases/reserve-seats.usecase';

@Controller()
export class ParticipationController {
  constructor(private readonly reserveSeat: ReserveSeatUseCase) {}

  @Post('/webinars/:id/participations')
  async handleReserveSeat(
    @Param('id') id: string,
    @Request() request: { user: User },
  ): Promise<WebinarAPI.ReserveSeat.Response> {
    return this.reserveSeat.execute({
      user: request.user,
      webinarId: id,
    });
  }
}
