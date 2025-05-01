import type { Role } from '$lib/roles';

export interface User {
	id: string;
	role: Role;
	email: string;
	prefix: string | null;
	name: string | null;
	hashedPassword: string | null;
	transcriptId: string | null;
}
