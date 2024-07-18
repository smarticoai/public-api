
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

    public static currencySymbol(currency: string) {
        return {
            [currency?.toUpperCase()]: currency?.toUpperCase(),
            USD: "$", // United States Dollar
            EUR: "€", // Euro
            JPY: "\u00A5", // Japanese Yen
            GBP: "£", // British Pound Sterling
            AUD: "A$", // Australian Dollar
            CAD: "C$", // Canadian Dollar
            CHF: "CHF", // Swiss Franc
            CNY: "¥", // Chinese Yuan
            SEK: "kr", // Swedish Krona
            NZD: "NZ$", // New Zealand Dollar
            MXN: "MX$", // Mexican Peso
            SGD: "S$", // Singapore Dollar
            HKD: "HK$", // Hong Kong Dollar
            NOK: "kr", // Norwegian Krone
            KRW: "₩", // South Korean Won
            TRY: "₺", // Turkish Lira
            INR: "₹", // Indian Rupee
            RUB: "₽", // Russian Ruble
            BRL: "R$", // Brazilian Real
            ZAR: "R", // South African Rand
        }[currency?.toUpperCase()];
    }
}

export { CoreUtils }