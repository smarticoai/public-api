export enum AvatarCustomizeErrorCode {
	AVATAR_USER_LIMIT = 12001,
	AVATAR_LABEL_LIMIT = 12002,
}

export const AvatarCustomizeErrorMessage: Record<AvatarCustomizeErrorCode, string> = {
	[AvatarCustomizeErrorCode.AVATAR_USER_LIMIT]: 'You have exceeded number of custom avatars creation, please try later',
	[AvatarCustomizeErrorCode.AVATAR_LABEL_LIMIT]: 'The custom avatars are not available, please try again later',
};
