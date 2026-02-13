import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DatabaseModule } from 'src/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { ConsumptionRecord, ConsumptionRecordSchema } from 'src/interview/schemas/consumption-record.schema';
import {
  UserConsumption,
  UserConsumptionSchema,
} from './schemas/consumption-record.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name:User.name,schema:UserSchema},
      { name: ConsumptionRecord.name, schema: ConsumptionRecordSchema },
      { name: UserConsumption.name, schema: UserConsumptionSchema },
    ])
    , DatabaseModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
