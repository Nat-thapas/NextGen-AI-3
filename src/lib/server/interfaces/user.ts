import type { Role } from '$lib/roles';

export interface User {
	id: string;
	role: Role;
	email: string;
	registered: boolean;
	prefix: string | null;
	name: string | null;
	transcriptId: string | null;
}
