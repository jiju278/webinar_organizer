import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { OrganizeWebinarUseCase } from './usecases/organize-webinar.usecase';
import { User } from './entities/user.entity';

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
  async handleOrganizeWebinar(@Body() body: any) {
    return this.organizeWebinar.execute({
      user: new User({ id: 'john-doe' }),
      title: body.title,
      seats: body.seats,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    });
  }
}
