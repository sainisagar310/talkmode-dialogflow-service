import { Body, Controller, Post } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { SpeechToTextDto, TextToSpeechDto } from './stt.dto';
import { SttService } from './stt.service';
import { TtsService } from './tts.service';

@Controller('speech')
@ApiUseTags('Speech')
export class SttController {
	constructor(private readonly ttsService: TtsService, private readonly sttService: SttService) {}

	@Post('text-to-speech')
	async textToSpeech(@Body() { text }: TextToSpeechDto) {
		const [{ audioContent }] = await this.ttsService.tts(text);
		const buffer = new Buffer(audioContent);
		const base64Audio = buffer.toString('base64');
		return Promise.resolve({ audioContent: base64Audio });
	}

	@Post('speech-to-text')
	async speechToText(@Body() audio: SpeechToTextDto): Promise<{ text: string }> {
        let text = null;
        const content = audio.content.replace('data:audio/wav;base64,', '');
        const res = await this.sttService.stt(content as any);
        const gotText = !!res[0].results.length;
        if(gotText) {
            text = res[0].results[0].alternatives[0].transcript;
        }
		return Promise.resolve({ text });
	}
}
