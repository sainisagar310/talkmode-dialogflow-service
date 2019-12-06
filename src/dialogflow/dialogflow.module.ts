import { Module } from '@nestjs/common';
import { DialogflowController } from './dialogflow.controller';
import { DialogflowConversionService } from './dialogflow-conversion/dialogflow-conversion.service';
import { ConfigModule } from '../config/config.module';

@Module({
	imports: [ConfigModule],
	controllers: [DialogflowController],
	providers: [DialogflowConversionService],
})
export class DialogflowModule {}
