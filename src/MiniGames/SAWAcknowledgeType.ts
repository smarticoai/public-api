export enum SAWAcknowledgeType {
	Silent = 1,
	QuickMessage = 2,
	FullMessage = 3,
	ExplicityAcknowledge = 4
}

export enum SAWAcknowledgeTypeName {
	Silent = 'silent',
	QuickMessage = 'quick-message',
	FullMessage = 'full-message',
	ExplicityAcknowledge = 'explicity-acknowledge'
}

/** @hidden */
export const SAWAcknowledgeTypeNamed = (type: SAWAcknowledgeType): SAWAcknowledgeTypeName => {
	return (
		{
			[SAWAcknowledgeType.Silent]: SAWAcknowledgeTypeName.Silent,
			[SAWAcknowledgeType.QuickMessage]: SAWAcknowledgeTypeName.QuickMessage,
			[SAWAcknowledgeType.FullMessage]: SAWAcknowledgeTypeName.FullMessage,
			[SAWAcknowledgeType.ExplicityAcknowledge]: SAWAcknowledgeTypeName.ExplicityAcknowledge
		}[type]
	);
};
