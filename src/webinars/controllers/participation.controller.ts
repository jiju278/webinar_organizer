import { Controller, Delete, Param, Post, Request } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { WebinarAPI } from '../contract';
import { ReserveSeatUseCase } from '../usecases/reserve-seats.usecase';
import { CancelSeatUseCase } from '../usecases/cancel-seat.usecase';

@Controller()
export class ParticipationController {
  constructor(
    private readonly reserveSeat: ReserveSeatUseCase,
    private readonly cancelSeat: CancelSeatUseCase,
  ) {}

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

  @Delete('/webinars/:id/participations')
  async handleCancelSeat(
    @Param('id') id: string,
    @Request() request: { user: User },
  ): Promise<WebinarAPI.CancelSeat.Response> {
    return this.cancelSeat.execute({
      user: request.user,
      webinarId: id,
    });
  }
}
