/* eslint-disable @typescript-eslint/no-namespace */
import {
  Schema as MongooseSchema,
  Prop,
  SchemaFactory,
} from '@nestjs/mongoose';
import { Participation } from 'src/webinars/entities/participation.entity';

export namespace MongoParticipation {
  export const CollectionName = 'participations';

  @MongooseSchema({ collection: CollectionName })
  export class SchemaClass {
    @Prop({ type: String })
    _id: string;

    @Prop({ type: String })
    webinarId: string;

    @Prop({ type: String })
    userId: string;

    static makeId(participation: Participation) {
      return participation.props.webinarId + ':' + participation.props.userId;
    }
  }
  export const Schema = SchemaFactory.createForClass(SchemaClass);
}
