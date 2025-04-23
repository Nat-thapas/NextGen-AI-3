export interface Announcement {
	id: string;
	title: string;
	text: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface AnnouncementDateString {
	id: string;
	title: string;
	text: string;
	createdAt: string;
	updatedAt: string;
}

export function convertAnnouncement(
	announcement: Announcement | AnnouncementDateString
): Announcement {
	return {
		id: announcement.id,
		title: announcement.title,
		text: announcement.text,
		createdAt:
			announcement.createdAt instanceof Date
				? announcement.createdAt
				: new Date(announcement.createdAt),
		updatedAt:
			announcement.updatedAt instanceof Date
				? announcement.updatedAt
				: new Date(announcement.updatedAt)
	};
}
