export interface Session {
	token: string;
	firstLoginIP: string;
	firstLoginUserAgent: string;
	lastUseIP: string;
	lastUseUserAgent: string;
	createdAt: Date;
	updatedAt: Date;
}
