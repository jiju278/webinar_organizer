/* eslint-disable @typescript-eslint/no-namespace */
import {
  Prop,
  Schema as MongooseSchema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export namespace MongoWebinar {
  export const CollectionName = 'webinars';
  @MongooseSchema({ collection: CollectionName })
  export class SchemaClass {
    @Prop({ type: String })
    _id: string;

    @Prop()
    organizerId: string;

    @Prop()
    title: string;
    @Prop()
    seats: number;
    @Prop()
    startDate: Date;
    @Prop()
    endDate: Date;
  }

  export const Schema = SchemaFactory.createForClass(SchemaClass);
  export type Document = HydratedDocument<SchemaClass>;
}
