import { TInboxMessage } from '../WSAPI/WSAPITypes';
import { ProtocolResponse } from '../Base/ProtocolResponse';
import { InboxMessage } from './InboxMessage';

export interface GetInboxMessagesResponse extends ProtocolResponse {
	log: InboxMessage[];
	unread_count: number;
}

export const InboxMessagesTransform = (items: InboxMessage[]): TInboxMessage[] => {
	return items.map((item) => {
		const x: TInboxMessage = {
			sent_date: item.createDate,
			message_guid: item.engagement_uid,
			read: item.is_read,
			favorite: item.is_starred,
			category_id: item.category_id,
			expire_on_dt: item.expire_on_dt,
		};
		return x;
	});
};
