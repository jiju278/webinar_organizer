import { ChangeSeatsUseCase } from './../usecases/change-seats.usecase';
import { Body, Controller, Param, Post, Put, Request } from '@nestjs/common';
import { OrganizeWebinarUseCase } from '../usecases/organize-webinar.usecase';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { User } from 'src/users/entities/user.entity';
import { WebinarAPI } from '../contract';

@Controller()
export class WebinarController {
  constructor(
    private readonly organizeWebinar: OrganizeWebinarUseCase,
    private readonly changeSeats: ChangeSeatsUseCase,
  ) {}

  @Post('/webinars')
  async handleOrganizeWebinar(
    @Body(new ZodValidationPipe(WebinarAPI.OrganizeWebinar.schema))
    body: WebinarAPI.OrganizeWebinar.Request,
    @Request() request: { user: User },
  ): Promise<WebinarAPI.OrganizeWebinar.Response> {
    return this.organizeWebinar.execute({
      user: request.user,
      title: body.title,
      seats: body.seats,
      startDate: body.startDate,
      endDate: body.endDate,
    });
  }

  @Put('/webinars/:id/seats')
  async handleChangeSeats(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(WebinarAPI.ChangeSeats.schema))
    body: WebinarAPI.ChangeSeats.Request,
    @Request() request: { user: User },
  ): Promise<WebinarAPI.ChangeSeats.Response> {
    return this.changeSeats.execute({
      user: request.user,
      webinarId: id,
      seats: body.seats,
    });
  }
}
