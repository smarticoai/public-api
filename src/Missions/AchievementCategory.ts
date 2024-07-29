import { TAchCategory } from '../WSAPI/WSAPITypes'
import { AchCategoryPublicMeta } from './AchCategoryPublicMeta'

export interface AchCategory {
	id?: number
	publicMeta?: AchCategoryPublicMeta
}

export const AchCategoryTransform = (items: AchCategory[]): TAchCategory[] => {
	return items.map((r) => {
		const x: TAchCategory = {
			id: r.id,
			name: r.publicMeta?.name,
			order: r.publicMeta?.order,
		}
		return x
	})
}
