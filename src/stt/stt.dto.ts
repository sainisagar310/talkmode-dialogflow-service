import { ApiModelProperty } from "@nestjs/swagger";

export class TextToSpeechDto {
	@ApiModelProperty()
    readonly text: string;
}
export class SpeechToTextDto {
	@ApiModelProperty()
    readonly content: string;
}