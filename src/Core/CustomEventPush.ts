import { ProtocolMessage } from '../Base/ProtocolMessage';

/**
 * An event the operator's own server pushed to this user through Smartico, delivered on every
 * open connection of the user. Smartico does not read or change `data`: it is exactly the object
 * the operator's server sent (up to 64 KB).
 *
 * Surfaced to consumers through the `custom_event` callback
 * (`_smartico.on('custom_event', (data, message) => …)`).
 *
 * Delivery is at most once per connection: an event is never sent twice to one connection, but it
 * can be lost (a connection that dropped silently). `uuid` is the same on every connection of the
 * user and on the resend after a short reconnect, so a site open in two tabs can dedupe on it.
 */
export interface CustomEventPush<T = unknown> extends ProtocolMessage {
	/** The payload exactly as the operator's server sent it */
	data: T;
	/** Unique per event; the same on every connection of the user and on a resend after a short reconnect */
	uuid: string;
	/** Server time of the push, epoch milliseconds */
	ts: number;
}
