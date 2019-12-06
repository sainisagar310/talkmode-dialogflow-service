import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import dialogflow from 'dialogflow';
import { DialogflowConversionService } from './dialogflow-conversion/dialogflow-conversion.service';
import { ConfigService } from '../config/config.service';
import { BuildDto, IntentRequestDto } from './dialogflow.dtos';
import { DialogFlowTreeNode, CreateIntentRequestModel, CreateIntentResponseModel, NodeType } from './dialogflow-conversion/dialogflow-conversion.interface';
import { DetectIntentResponse, ListIntentResponse } from './dialogflow.interface';

@Controller('dialogflow')
@ApiUseTags('dialogflow')
export class DialogflowController {
	private readonly projectId: string = this.configService.get('gcp_project_id');
	private readonly credentials = { keyFilename: this.configService.get('gcp_keyfile') };

	private readonly intentsClient = new dialogflow.IntentsClient(this.credentials);
	private readonly sessionClient = new dialogflow.SessionsClient(this.credentials);

	private readonly agentPath = this.intentsClient.projectAgentPath(this.projectId);

	constructor(private readonly dialogflowConversionService: DialogflowConversionService, private readonly configService: ConfigService) {}

	@Post()
	async build(@Body() data: BuildDto): Promise<string> {
        const dialogflow = data.nodes.find(n => NodeType.DialogFlow === n.type);
        await this.findIntentAndDelete(dialogflow.value);
		this.dialogflowConversionService.init((data.nodes as unknown) as DialogFlowTreeNode[]);
        const intents = this.dialogflowConversionService.convert();
		return new Promise((resolve, reject) => this.postToDialogflow(intents, resolve, reject));
	}

	private postToDialogflow(intents: CreateIntentRequestModel[], resolve: (value?: string) => void, reject: (reason?: any) => void): void {
		const index = intents.findIndex(i => {
			const { parentFollowupIntentName, rootFollowupIntentName, _uploaded } = i;
			if (_uploaded) {
				return false;
			}
			if (!!rootFollowupIntentName) {
				const noValue = rootFollowupIntentName.split('NOTSET__').length > 1;
				if (noValue) {
					return false;
				}
			}
			if (!!parentFollowupIntentName) {
				const noValue = parentFollowupIntentName.split('NOTSET__').length > 1;
				if (noValue) {
					return false;
				}
			}
			return true;
		});
		if (index !== -1) {
			const intent = intents[index];
			this.intentsClient
				.createIntent({ parent: this.agentPath, intent })
				.then((response: CreateIntentResponseModel[]) => {
					intents[index]._uploaded = true;
					const updatedIntentsWithIds = this.dialogflowConversionService.updateDataSet(intent, response[0], intents);
					this.postToDialogflow(updatedIntentsWithIds, resolve, reject);
				})
				.catch(reject);
		} else {
			resolve('OK');
		}
	}

	@Post('detect-intent')
	async intentRequest(@Body() data: IntentRequestDto): Promise<DetectIntentResponse> {
		const { session, text } = data;
		const sessionPath = this.sessionClient.sessionPath(this.projectId, session);
		const request = {
			session: sessionPath,
			queryInput: {
				text: {
					text,
					languageCode: 'en-US',
				},
			},
		};
		const responses = await this.sessionClient.detectIntent(request);
		const result = responses[0].queryResult;

		const response: DetectIntentResponse = {
			text: result.fulfillmentText,
		};

		const list = result.fulfillmentMessages.find(m => !!m.listSelect);
		if (list) {
			response.list = list.listSelect.items;
		}

		const image = result.fulfillmentMessages.find(m => !!m.image);
		if (image) {
			response.image = image.image;
		}
		return Promise.resolve(response);
	}

	@Get('intents')
	async listIntents(): Promise<ListIntentResponse[]> {
		return this.getIntents();
    }
    
    private async getIntents(): Promise<ListIntentResponse[]> {
        const intents = await this.intentsClient.listIntents({ parent: this.agentPath });
		const response = intents[0]
			.filter(intent => !intent.parentFollowupIntentName || !intent.parentFollowupIntentName.length)
            .map<ListIntentResponse>(intent => ({ id: this.dialogflowConversionService.__extractIntentId(intent.name), name: intent.displayName }));
        return Promise.resolve(response);
    }

    private async findIntentAndDelete(displayName: string): Promise<void> {
        const listOfIntents = await this.getIntents();
        const isIntentAlreadyBuilt = listOfIntents.find(i => i.name === displayName);
        if(isIntentAlreadyBuilt) {
            await this.intentsClient.deleteIntent({ name: `projects/${this.projectId}/agent/intents/${isIntentAlreadyBuilt.id}` });
        }
        return Promise.resolve();
    }
}
