import { InboxCategories } from './InboxCategories';
import { ProtocolMessage } from '../Base/ProtocolMessage';
import { InboxReadStatus } from './InboxReadStatus';

export interface GetInboxMessagesRequest extends ProtocolMessage {
	limit?: number;
	offset?: number;
	starred_only?: boolean;
	category_id?: InboxCategories;
	read_status?: InboxReadStatus;
}
