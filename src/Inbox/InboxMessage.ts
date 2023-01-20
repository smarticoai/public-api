import { InboxMessageType } from "./InboxMessageType";

export interface InboxMessage {

    createDate: string;
    body: {
        action: string;
        body: string;
        type: InboxMessageType;
        image: string;
        title: string;
        html_body: string;
    };
    engagement_uuid: string;
    ff: string;
}
