import type { Role } from '$lib/roles';

export interface User {
	id: string;
	role: Role;
	email: string;
	hashedPassword: string | null;
	transcriptId: string | null;
}
