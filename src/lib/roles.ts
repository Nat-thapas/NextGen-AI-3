export type Role = 'registrant' | 'student' | 'staff' | 'teacher' | 'admin' | 'superadmin';

// higher number = higher role
const roleValues: Record<Role, number> = {
	registrant: 1,
	student: 2,
	staff: 3,
	teacher: 4,
	admin: 5,
	superadmin: 6
};

export function isRoleAtLeast(role: Role | null | undefined, reference: Role): boolean {
	if (!role) return false;
	return roleValues[role] >= roleValues[reference];
}
