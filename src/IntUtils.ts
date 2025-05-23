class IntUtils {
	public static uuid(): string {
		let a: any;
		let b: any;
		for (
			b = a = '';
			a++ < 36;
			b += (a * 51) & 52 ? (a ^ 15 ? 8 ^ (Math.random() * (a ^ 20 ? 16 : 4)) : 4).toString(16) : '-'
		) {}
		return b;
	}

	public static isNotNull(val: any): boolean {
		return typeof val !== 'undefined' && val !== null;
	}

	public static isNotEmpty(val: string): boolean {
		return typeof val !== 'undefined' && val !== null && val.length > 0;
	}

	public static replaceAll(value: string, regex: string, replacement: string | number): string {
		if (IntUtils.isNotNull(value)) {
			return value.replace(new RegExp(IntUtils.escapeRegExp(regex), 'g'), replacement?.toString());
		}
		return value;
	}

	public static escapeRegExp(v: string): string {
		if (IntUtils.isNotEmpty(v)) {
			return v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		}
		return v;
	}

	public static JsonOrText = (str: string): any => {
		if (str && str.includes && (str.includes('{') || str.includes('['))) {
			try {
				return JSON.parse(str);
			} catch (e) {
				return str;
			}
		}
		return str || {};
	};

	// public static wsTimeToEpoch = (time: string): number => {
	//     if (time) {
	//         return moment.utc(time, "DD/MM/YYYY HH:mm:ss").valueOf()
	//     } else {
	//         return null
	//     }
	// }

	public static isWithinPeriod = (timestamp: number, period: 'today' | 'thisWeek' | 'thisMonth'): boolean => {
		const now = new Date();
		const completedDate = new Date(timestamp);

		switch (period) {
			case 'today':
				return (
					now.getFullYear() === completedDate.getFullYear() &&
					now.getMonth() === completedDate.getMonth() &&
					now.getDate() === completedDate.getDate()
				);
			case 'thisWeek':
				const startOfWeek = new Date(now);
				startOfWeek.setDate(now.getDate() - now.getDay());
				startOfWeek.setHours(0, 0, 0, 0);

				const endOfWeek = new Date(startOfWeek);
				endOfWeek.setDate(startOfWeek.getDate() + 6);
				endOfWeek.setHours(23, 59, 59, 999);

				return completedDate >= startOfWeek && completedDate <= endOfWeek;
			case 'thisMonth':
				return now.getFullYear() === completedDate.getFullYear() && now.getMonth() === completedDate.getMonth();
			default:
				return false;
		}
	};
}

export { IntUtils };
