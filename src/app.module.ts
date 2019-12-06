import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DialogflowModule } from './dialogflow/dialogflow.module';
import { ConfigModule } from './config/config.module';
import { SttModule } from './stt/stt.module';

@Module({
	imports: [DialogflowModule, ConfigModule, SttModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
