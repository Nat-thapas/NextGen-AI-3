export interface Session {
	token: string;
	firstLoginIp: string;
	firstLoginUserAgent: string;
	lastUseIp: string;
	lastUseUserAgent: string;
	createdAt: Date;
	updatedAt: Date;
}
