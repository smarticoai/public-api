import { TInboxMessageBody } from '../WSAPI/WSAPITypes';
import { InboxMessageType } from './InboxMessageType';

export interface InboxMessageBody {
	// URL or deep-link that neeed to be executed when user clicks on the message
	action: string;
	// the body of the message in case it's 'simple' inbox message
	body: string;
	// type of message, deprecated
	type: InboxMessageType;
	// image of the icon
	image: string;
	// title of the message
	title: string;
	// HTML body of the message in case it's 'rich' inbox message
	html_body: string;
	// set of the buttons with text on the button and action that could be URL or deep-link
	additional_buttons?: { inbox_cta_text: string; action: string }[];
	// indicator if the message need to be shown when sent and overlay or it should be shown only in the inbox, when user open 'inbox' interface explicitly
	// default is 'true'
	show_preview?: boolean;
	// duration in seconds for how long to show preview, default is 7 seconds
	show_duration_sec?: number;
}

export interface InboxMessage {
	// date when the message was created
	createDate: string;
	// body of the message according to the interface
	body: InboxMessageBody;
	// unique identifier of the message that connects it to the campaign from which it was sent
	engagement_uid: string;
	// flag that indicates if the message was read by the user
	is_read: boolean;
	// flag that indicates if the message was marked as favorite by the user
	is_starred: boolean;
	// flag that indicates if the message was deleted by the user. Such messages are not returned in the response and property is used only internaly in Smartico
	is_deleted?: boolean;
}

export const InboxMessageBodyTransform = (item: InboxMessageBody): TInboxMessageBody => {
	const x: TInboxMessageBody = {
		action: item.action,
		icon: item.image,
		title: item.title,
		preview_body: item.body,
	};

	if (item.action === 'dp:inbox') {
		if (item.additional_buttons && item.additional_buttons.length) {
			x.buttons = item.additional_buttons.map((b) => ({
				action: b.action,
				text: b.inbox_cta_text,
			}));
		}

		x.html_body = item?.html_body || null;
	}

	return x;
};
