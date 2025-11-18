import { IntUtils } from '../IntUtils';
import { TInboxMessageBody } from '../WSAPI/WSAPITypes';
import { InboxCategories } from './InboxCategories';
import { InboxMessageType } from './InboxMessageType';
import { OpenLinksType } from './OpenLinksType';

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
	// indicator if the image in html_body can be zoomed out
	// default is 'false'
	enable_zoom_mode?: boolean;
	// options that allows to open links in buttons either in new window or in the current one
	open_links?: OpenLinksType;
	// The custom data of the inbox message defined by operator. Can be a JSON object, string or number
	custom_data?: string;
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
	// category id of the inbox message, could be categorized as System/Personal/General messages in mentioned tabs
	category_id?: InboxCategories;
	// The epoch timestamp, with milliseconds, when the message is going to be expired 
	expire_on_dt?: number;
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
		x.custom_data = IntUtils.JsonOrText(item?.custom_data);
	}

	return x;
};
