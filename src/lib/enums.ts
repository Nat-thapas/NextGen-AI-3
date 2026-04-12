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
	file: 'file',
	code: 'code'
} as const;

export const scoringTypes = {
	exact: 'exact',
	regex: 'regex',
	and: 'and',
	or: 'or',
	scale: 'scale'
} as const;

export enum HttpMethod {
	GET = 'GET',
	HEAD = 'HEAD',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE',
	CONNECT = 'CONNECT',
	OPTIONS = 'OPTIONS',
	TRACE = 'TRACE',
	PATCH = 'PATCH'
}
