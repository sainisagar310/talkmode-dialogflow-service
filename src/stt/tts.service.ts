import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { google as ttsProtosTypes } from '@google-cloud/text-to-speech/build/protos/protos';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

const { SsmlVoiceGender, AudioEncoding } = ttsProtosTypes.cloud.texttospeech.v1;

@Injectable()
export class TtsService {
	private readonly client = new TextToSpeechClient(({ keyFilename: this.configService.get('gcp_keyfile') } as unknown) as null);

	constructor(private readonly configService: ConfigService) {}

	tts(text: string) {
		const request = {
			input: { text },
			voice: { languageCode: 'en-US', ssmlGender: SsmlVoiceGender.FEMALE },
			audioConfig: { audioEncoding: AudioEncoding.MP3 },
		};
		return this.client.synthesizeSpeech(request);
	}
}
