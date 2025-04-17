export const roles = {
	registrant: 'registrant',
	student: 'student',
	staff: 'staff',
	teacher: 'teacher',
	admin: 'admin',
	superadmin: 'superadmin'
} as const;

export const questionTypes = {
	choices: 'choices',
	checkboxes: 'checkboxes',
	text: 'text',
	file: 'file'
};

export const scoringTypes = {
	exact: 'exact',
	regex: 'regex',
	and: 'and',
	or: 'or',
	scale: 'scale'
};
