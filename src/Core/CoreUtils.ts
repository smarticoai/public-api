
class CoreUtils {

    public static avatarUrl = (avatar_id: string, avatarDomain: string): string => {
        if (avatar_id !== null && avatar_id !== undefined && !(avatar_id.startsWith && avatar_id.startsWith('http'))) {
            if (avatarDomain.endsWith('/')) {
                avatarDomain = avatarDomain.slice(0, -1) + '/avatar/' + avatar_id
            } else {
                avatarDomain = avatarDomain + '/avatar/' + avatar_id
            }
        } else {
            return avatar_id
        }
    }
}

export { CoreUtils }