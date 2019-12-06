import { Injectable } from '@nestjs/common';
import { CreateIntentListItem, CreateIntentRequestModel, CreateIntentResponseModel, DialogFlowModel, DialogFlowTreeNode, DialogModel, IntentModel, NodeType, TrainingPhrase } from './dialogflow-conversion.interface';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class DialogflowConversionService {
	private readonly projectId: string = this.configService.get('gcp_project_id');
	private intents: CreateIntentRequestModel[] = [];
	private nodes: DialogFlowTreeNode[];
	constructor(private readonly configService: ConfigService) {}

	public init(nodes: DialogFlowTreeNode[]) {
		/** reset */
		this.nodes = nodes;
		this.intents = [];

		/** conversion  */
		const dialogflow = this.nodes.find(n => n.type === NodeType.DialogFlow) as DialogFlowModel;
		const entryDialog = this.nodes.find(n => n.type === NodeType.Dialog && n.isHead) as DialogModel;
		const intents = this.nodes.filter(n => n.type === NodeType.Intent) as IntentModel[];
		this.buildRootIntent(dialogflow, entryDialog);
		intents.forEach(i => this.buildIntent(i, entryDialog));
	}

	private buildRootIntent(dialogflow: DialogFlowModel, entryDialog: DialogModel): void {
		const intent: CreateIntentRequestModel = {
			_originalId: entryDialog.id,
			displayName: dialogflow.value,
			trainingPhrases: [
				{
					parts: [
						{
							text: dialogflow.id,
						},
					],
				},
			],
			messages: [
				{
					text: {
						text: [entryDialog.value],
					},
				},
			],
			inputContextNames: [],
			outputContexts: [
				{
					name: this.__generateContext(entryDialog),
					lifespanCount: 2,
				},
			],
		};
		if (entryDialog.isOptional) {
			const images = this.__extractImagesFromChilds(entryDialog.id);
			if (images) {
				intent.messages.push({ listSelect: { items: images } });
			}
		} else {
			const hasImage = entryDialog.imageUrl && !!entryDialog.imageUrl.length;
			if (hasImage) {
				intent.messages.push({ image: { imageUri: entryDialog.imageUrl, accessibilityText: entryDialog.value } });
			}
		}

		this.intents.push(intent);
	}

	private buildIntent(intent: IntentModel, entryDialog: DialogModel): void {
		const parentDialog = this.nodes.find(n => n.type === NodeType.Dialog && intent.dialogId === n.id) as DialogModel;
		const childDialog = this.nodes.find(n => n.type === NodeType.Dialog && n.id === intent.nextDialogId);
		const dIntent: CreateIntentRequestModel = {
			_originalId: childDialog.id,
			displayName: `${parentDialog.id} - ${intent.value}`,
			trainingPhrases: !!intent.utterances.length ? intent.utterances.map<TrainingPhrase>(u => ({ parts: [{ text: u.value }] })) : [{ parts: [{ text: intent.value }] }],
			messages: [{ text: { text: [childDialog.value] } }],
			rootFollowupIntentName: this.__getFollowupName(entryDialog),
			parentFollowupIntentName: this.__getFollowupName(parentDialog),
			inputContextNames: [this.__generateContext(parentDialog)],
			outputContexts: [
				{
					name: this.__generateContext(childDialog),
					lifespanCount: 2,
				},
			],
		};
		if (childDialog.isOptional) {
			const images = this.__extractImagesFromChilds(childDialog.id);
			if (images) {
				dIntent.messages.push({ listSelect: { items: images } });
			}
		} else {
			const hasImage = childDialog.imageUrl && !!childDialog.imageUrl.length;
			if (hasImage) {
				dIntent.messages.push({ image: { imageUri: childDialog.imageUrl, accessibilityText: childDialog.value } });
			}
		}
		this.intents.push(dIntent);
	}

	private __getFollowupName(node: DialogFlowTreeNode): string {
		return `projects/${this.projectId}/agent/intents/NOTSET__${node.id}`;
	}

	private __generateContext(node: DialogFlowTreeNode): string {
		return `projects/${this.projectId}/agent/sessions/-/contexts/${node.id}__followup`;
	}

	public __extractIntentId(name: string): string {
		const splited = name.split('/');
		return splited[splited.length - 1];
	}

	private __extractImagesFromChilds(dialogId: string): CreateIntentListItem[] {
		const childs = this.nodes.filter(n => n.type === NodeType.Intent && n.dialogId === dialogId && !!n.imageUrl && !!n.imageUrl.length);
		const listItems = childs.map<CreateIntentListItem>(n => ({
			image: { imageUri: n.imageUrl, accessibilityText: n.value },
			title: n.value,
			info: {
				key: !!n.utterances.length ? n.utterances[0].value : n.value,
				synonyms: !!n.utterances.length ? [n.value, ...n.utterances.map<string>(u => u.value)] : [n.value],
			},
		}));
		return listItems.length > 1 && listItems;
	}

	private updateIntentId(name: string, intentId: string, originalIntentId: string) {
		const splitedName = name.split(/(NOTSET__)/g);
		const lastIndex = splitedName.length - 1;
		if (splitedName[lastIndex] === originalIntentId) {
			splitedName[lastIndex - 1] = '';
			splitedName[lastIndex] = intentId;
		}
		return splitedName.join('');
	}

	public updateDataSet(intent: CreateIntentRequestModel, response: CreateIntentResponseModel, intents: CreateIntentRequestModel[]): CreateIntentRequestModel[] {
		console.log(response);
		const intentId = this.__extractIntentId(response.name);
		const originalIntentId = intent._originalId;
		intents.forEach((i, index) => {
			if (!i._uploaded) {
				const { rootFollowupIntentName, parentFollowupIntentName } = i;
				if (!!rootFollowupIntentName) {
					intents[index].rootFollowupIntentName = this.updateIntentId(rootFollowupIntentName, intentId, originalIntentId);
				}
				if (!!parentFollowupIntentName) {
					intents[index].parentFollowupIntentName = this.updateIntentId(parentFollowupIntentName, intentId, originalIntentId);
				}
			}
		});
		return intents;
	}

	public convert(): CreateIntentRequestModel[] {
		return this.intents;
	}
}
