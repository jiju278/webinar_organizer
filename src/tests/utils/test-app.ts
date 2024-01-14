import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/core/app.module';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { IFixture } from './fixture';
import { MongoUser } from 'src/users/adapters/mongo/mongo-user';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

export class TestApp {
  private app: INestApplication;

  async setup() {
    const module = await Test.createTestingModule({
      imports: [
        AppModule,
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          ignoreEnvVars: true,
          isGlobal: true,
          load: [
            () => ({
              DATABASE_URL:
                'mongodb://admin:azerty@localhost:3701/webinars?authSource=admin&directConnection=true',
            }),
          ],
        }),
      ],
    }).compile();

    this.app = module.createNestApplication();
    await this.app.init();
    await this.clearDatabase();
  }

  async cleanup() {
    await this.app.close();
  }

  async loadFixtures(fixtures: IFixture[]) {
    return Promise.all(fixtures.map((fixture) => fixture.load(this)));
  }
  get<T>(name: any) {
    return this.app.get<T>(name);
  }

  getHttpServer() {
    return this.app.getHttpServer();
  }

  private async clearDatabase() {
    await this.app
      .get<Model<MongoUser.SchemaClass>>(
        getModelToken(MongoUser.CollectionName),
      )
      .deleteMany({});
  }
}
