import { Module } from '@nestjs/common';
import { SttController } from './stt.controller';
import { SttService } from './stt.service';
import { ConfigModule } from '../config/config.module';
import { TtsService } from './tts.service';

@Module({
    imports: [ConfigModule],
	controllers: [SttController],
	providers: [SttService, TtsService],
})
export class SttModule {}
