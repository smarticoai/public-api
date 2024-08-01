import { ClassId } from './ClassId';

export interface ProtocolMessage {
	cid: number; // can be ClassId when we move all ClassIds from ach to use @smartico
	ts?: number;
	uuid?: string;

	// eventType?: string;
	// payload?: any;
}
