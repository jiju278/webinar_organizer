import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { OrganizeWebinarUseCase } from './usecases/organize-webinar.usecase';
import { User } from './entities/user.entity';
import { ZodValidationPipe } from './pipes/zod-validation.pipe';
import { WebinarAPI } from './app/contract';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly organizeWebinar: OrganizeWebinarUseCase,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/webinars')
  async handleOrganizeWebinar(
    @Body(new ZodValidationPipe(WebinarAPI.OrganizeWebinar.schema))
    body: WebinarAPI.OrganizeWebinar.Request,
  ): Promise<WebinarAPI.OrganizeWebinar.Response> {
    return this.organizeWebinar.execute({
      user: new User({ id: 'john-doe' }),
      title: body.title,
      seats: body.seats,
      startDate: body.startDate,
      endDate: body.endDate,
    });
  }
}
