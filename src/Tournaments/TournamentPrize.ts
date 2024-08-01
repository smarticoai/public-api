import { ActivityTypeLimited } from '../Core/ActivityTypeLimited';

export interface TournamentPrize {
	name: string;
	description: string;
	image_url: string;
	place_from: number;
	place_to: number;
	type: ActivityTypeLimited;
	points: number;
}
