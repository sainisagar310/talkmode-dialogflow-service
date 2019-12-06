import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { google as sttProtosTypes } from "@google-cloud/speech/build/protos/protos";
import { SpeechClient } from '@google-cloud/speech';
const { RecognitionConfig } = sttProtosTypes.cloud.speech.v1;

@Injectable()
export class SttService {
    private readonly client = new SpeechClient(({ keyFilename: this.configService.get('gcp_keyfile') } as unknown) as null);
    constructor(private readonly configService: ConfigService) {}
    stt(buffer: Uint8Array) {
		const request = {
			audio: { content: buffer },
			config: {
				encoding: RecognitionConfig.AudioEncoding.LINEAR16,
				sampleRateHertz: 16000,
				languageCode: 'en-US',
			},
		};
		return this.client.recognize(request);
	}
}
