import { CreateIntentImageMessage, CreateIntentListItem } from "./dialogflow-conversion/dialogflow-conversion.interface";

export interface DetectIntentResponse {
    text: string;
    list?: CreateIntentListItem[];
    image?: CreateIntentImageMessage;
}
export interface ListIntentResponse {
    id: string;
    name: string;
}