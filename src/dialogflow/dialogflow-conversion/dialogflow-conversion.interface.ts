export type IOptional<T> = {
	[P in keyof T]?: T[P];
};

export interface IBase {
	id: string;
}

export interface DialogFlowModel extends IBase {
	name: string;
	value: string;
	description: string;
	unit?: number;
	order?: number;
	type: NodeType;
}

export interface DialogModel extends IBase {
	value: string;
	imageUrl?: string;
	isOptional: boolean;
	order?: number;
	retryCount?: number;
	isHead: boolean;
	type: NodeType;
}

export interface IntentModel extends IBase {
	dialogId: string;
	value: string;
	nextDialogId: string;
	order?: number;
	type: NodeType;
	imageUrl: string;
	utterances: UtteranceModel[];
}

export interface UtteranceModel extends IBase {
	value: string;
}

export enum NodeType {
	DialogFlow = 0,
	Dialog = 1,
	Intent = 2,
}
export const NodeTypes = {
	DialogFlow: 0,
	Dialog: 1,
	Intent: 2,
};

export type DialogFlowTreeNode = IOptional<DialogFlowModel> & IOptional<DialogModel> & IOptional<IntentModel>;

export interface DialogFlowResponse extends DialogFlowModel {
	dialogFlow: DialogFlowTreeNode[];
}

export interface CreateIntentRequestModel {
	/**
	 * Id from our database
	 */
	_originalId: string;
	_uploaded?: boolean;
	displayName: string;
	messages: [CreateIntentDefaultMessage | { image: CreateIntentImageMessage } | CreateIntentListMessage];
	trainingPhrases: TrainingPhrase[];
	rootFollowupIntentName?: string;
	parentFollowupIntentName?: string;
	inputContextNames?: string[];
	outputContexts?: OutputContext[];
}
export interface CreateIntentDefaultMessage {
	text: {
		text: string[];
	};
}

export interface CreateIntentImageMessage {
	imageUri: string;
	accessibilityText: string;
}
export interface CreateIntentListMessage {
	listSelect: {
		title?: string;
		subtitle?: string;
		items: CreateIntentListItem[];
	};
}
export interface CreateIntentListItem {
	info: {
		key: string;
		synonyms?: string[];
	};
	title: string;
	description?: string;
	image?: CreateIntentImageMessage;
}

export interface TrainingPhrase {
	parts: Array<{
		text: string;
	}>;
}

export interface OutputContext {
	name: string;
	parameters?: any;
	lifespanCount?: number;
}

export interface CreateIntentResponseModel {
	name: string;
}
