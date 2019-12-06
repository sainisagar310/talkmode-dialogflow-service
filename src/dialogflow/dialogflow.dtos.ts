import { ApiModelProperty } from '@nestjs/swagger';
import { DialogFlowTreeNode, NodeType, NodeTypes } from './dialogflow-conversion/dialogflow-conversion.interface';

class NodeDto {
	@ApiModelProperty()
	readonly id: string;
	@ApiModelProperty()
	readonly name: string;
	@ApiModelProperty()
	readonly value: string;
	@ApiModelProperty()
	readonly description: string;
	@ApiModelProperty()
	readonly unit?: number;
	@ApiModelProperty()
	readonly order?: number;
	@ApiModelProperty({ enum: Object.values(NodeTypes) })
	readonly type: number;
	@ApiModelProperty()
	imageUrl?: string;
	@ApiModelProperty()
	isOptional: boolean;
	@ApiModelProperty()
	retryCount?: number;

	@ApiModelProperty()
	isHead: boolean;
	@ApiModelProperty()
	dialogId: string;
	@ApiModelProperty()
	nextDialogId: string;
	@ApiModelProperty({ isArray: true })
	utterances: string;
}

export class BuildDto {
	@ApiModelProperty({ type: NodeDto, isArray: true })
	readonly nodes: NodeDto[];
}

export class IntentRequestDto {
	@ApiModelProperty()
    readonly text: string;
    
    @ApiModelProperty()
    readonly session: string;
}
