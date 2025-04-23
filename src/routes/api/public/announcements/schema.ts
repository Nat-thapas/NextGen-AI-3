import { type } from 'arktype';

export const Options = type({
	limit: type('string.integer.parse')
		.to('number > 0')
		.or(type.null.pipe(() => 5))
		.or(type.undefined.pipe(() => 5))
		.default('5'),
	offset: type('string.integer.parse')
		.to('number >= 0')
		.or(type.null.pipe(() => 0))
		.or(type.undefined.pipe(() => 0))
		.default('0')
});

export interface AnnouncementsResponse {
	announcements: {
		text: string;
		id: string;
		createdAt: string;
		updatedAt: string;
		title: string;
	}[];
	moreAnnouncementsAvailable: boolean;
}
