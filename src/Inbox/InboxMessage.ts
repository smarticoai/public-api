import { TInboxMessageBody } from "../WSAPI/WSAPITypes";
import { InboxMessageType } from "./InboxMessageType";

export interface InboxMessageBody {
    action: string;
    body: string;
    type: InboxMessageType;
    image: string;
    title: string;
    html_body: string;  
    additional_buttons?: { inbox_cta_text: string, action: string }[];
}

export interface InboxMessage {

    createDate: string;
    body: InboxMessageBody;
    engagement_uid: string;
    is_read: boolean;
    is_starred: boolean;
    is_deleted?: boolean;
}

export const InboxMessageBodyTransform = (item: InboxMessageBody): TInboxMessageBody => {
    
    const x: TInboxMessageBody = {
        action: item.action,
        icon: item.image,
        title: item.title,
        preview_body: item.body,
    }

    if (item.action === 'dp:inbox') {
        if (item.additional_buttons && item.additional_buttons.length) {
            x.buttons = item.additional_buttons.map(b => ({
                action: b.action,
                text: b.inbox_cta_text
            }))
        }

        x.html_body = item?.html_body || null;
    }

    return x;
}
