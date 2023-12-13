
class CoreUtils {

    public static avatarUrl = (avatar_id: string, avatarDomain: string): string => {
        if (avatarDomain && avatar_id !== null && avatar_id !== undefined && !(avatar_id.startsWith && avatar_id.startsWith('http'))) {
            if (avatarDomain.endsWith('/')) {
                return avatarDomain.slice(0, -1) + '/avatar/' + avatar_id
            } else {
                return avatarDomain + '/avatar/' + avatar_id
            }
        } else {
            return avatar_id
        }
    }
}

export { CoreUtils }