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
    engagement_uid: string;
    is_read: boolean;
    is_starred: boolean;
    additional_buttons?: { inbox_cta_text: string, action: string }
}
