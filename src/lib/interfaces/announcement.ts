export class Announcement {
	id: string;
	title: string;
	text: string;
	createdAt: Date;
	updatedAt: Date;

	constructor(announcement: Announcement) {
		this.id = announcement.id;
		this.title = announcement.title;
		this.text = announcement.text;
		this.createdAt = announcement.createdAt;
		this.updatedAt = announcement.updatedAt;
	}
}
