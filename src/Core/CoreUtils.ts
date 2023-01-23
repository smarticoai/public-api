
class CoreUtils {

    public static avatarUrl = (avatar_id: string, avatarDomain: string) {
        if (!(avatar_id && avatar_id.startsWith('http'))) {
            return avatarDomain + '/avatar/' + avatar_id
        } else {
            return avatar_id
        }
    }
}

export { CoreUtils }