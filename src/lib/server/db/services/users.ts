/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { suidToUuid } from '$lib/server/db/suid';

const createUserQuery = db
	.insert(users)
	.values({
		role: sql.placeholder('role'),
		email: sql.placeholder('email'),
		verificationToken: sql.placeholder('verificationToken'),
		verificationTokenGeneratedAt: sql`now()`,
		lastEmailSentAt: sql`now()`
	})
	.prepare('create_user');

const getUserQuery = db.query.users
	.findFirst({ where: eq(users.id, sql.placeholder('id')) })
	.prepare('get_user');

const getUserByEmailQuery = db.query.users
	.findFirst({
		where: eq(users.email, sql.placeholder('email'))
	})
	.prepare('get_user_by_email');

const getUserByVerificationTokenQuery = db.query.users
	.findFirst({
		where: eq(users.verificationToken, sql.placeholder('verificationToken'))
	})
	.prepare('get_user_by_verification_token');

const getUserByPasswordResetTokenQuery = db.query.users
	.findFirst({
		where: eq(users.passwordResetToken, sql.placeholder('passwordResetToken'))
	})
	.prepare('get_user_by_password_reset_token');

const updateUserVerificationTokenQuery = db
	.update(users)
	.set({
		verificationToken: sql.placeholder('verificationToken'),
		verificationTokenGeneratedAt: sql`now()`,
		lastEmailSentAt: sql`now()`,
		updatedAt: sql`now()`
	})
	.where(eq(users.id, sql.placeholder('id')))
	.prepare('update_user_verification_token');

const updateUserPasswordResetTokenQuery = db
	.update(users)
	.set({
		passwordResetToken: sql.placeholder('passwordResetToken'),
		passwordResetTokenGeneratedAt: sql`now()`,
		lastEmailSentAt: sql`now()`,
		updatedAt: sql`now()`
	})
	.where(eq(users.id, sql.placeholder('id')))
	.prepare('update_user_password_reset_token');

const updateUserProfileQuery = db
	.update(users)
	.set({
		prefix: sql.placeholder('prefix'),
		name: sql.placeholder('name'),
		nickname: sql.placeholder('nickname'),
		phoneNumber: sql.placeholder('phoneNumber'),
		schoolName: sql.placeholder('schoolName'),
		grade: sql.placeholder('grade'),
		addressProvince: sql.placeholder('addressProvince'),
		addressDistrict: sql.placeholder('addressDistrict'),
		addressSubDistrict: sql.placeholder('addressSubDistrict'),
		addressPostcode: sql.placeholder('addressPostcode'),
		addressDetail: sql.placeholder('addressDetail'),
		updatedAt: sql`now()`
	})
	.where(eq(users.id, sql.placeholder('id')))
	.prepare('update_user_profile');

const updateUserProfileWithTranscriptQuery = db
	.update(users)
	.set({
		prefix: sql.placeholder('prefix'),
		name: sql.placeholder('name'),
		nickname: sql.placeholder('nickname'),
		phoneNumber: sql.placeholder('phoneNumber'),
		schoolName: sql.placeholder('schoolName'),
		grade: sql.placeholder('grade'),
		transcriptId: sql.placeholder('transcriptId'),
		addressProvince: sql.placeholder('addressProvince'),
		addressDistrict: sql.placeholder('addressDistrict'),
		addressSubDistrict: sql.placeholder('addressSubDistrict'),
		addressPostcode: sql.placeholder('addressPostcode'),
		addressDetail: sql.placeholder('addressDetail'),
		updatedAt: sql`now()`
	})
	.where(eq(users.id, sql.placeholder('id')))
	.prepare('update_user_profile_with_transcript');

const updateUserProfileRegistrationCompleteQuery = db
	.update(users)
	.set({
		registrationComplete: true,
		verificationToken: null,
		prefix: sql.placeholder('prefix'),
		name: sql.placeholder('name'),
		nickname: sql.placeholder('nickname'),
		phoneNumber: sql.placeholder('phoneNumber'),
		schoolName: sql.placeholder('schoolName'),
		grade: sql.placeholder('grade'),
		transcriptId: sql.placeholder('transcriptId'),
		addressProvince: sql.placeholder('addressProvince'),
		addressDistrict: sql.placeholder('addressDistrict'),
		addressSubDistrict: sql.placeholder('addressSubDistrict'),
		addressPostcode: sql.placeholder('addressPostcode'),
		addressDetail: sql.placeholder('addressDetail'),
		updatedAt: sql`now()`
	})
	.where(eq(users.id, sql.placeholder('id')))
	.prepare('update_user_profile_registration_complete');

const updateUserPasswordQuery = db
	.update(users)
	.set({
		hashedPassword: sql.placeholder('hashedPassword'),
		updatedAt: sql`now()`
	})
	.where(eq(users.id, sql.placeholder('id')))
	.prepare('update_user_password');

export async function createUser(role: string, email: string, verificationToken: string) {
	return createUserQuery.execute({ role, email, verificationToken });
}

export async function getUser(id: string) {
	id = suidToUuid(id);
	return getUserQuery.execute({ id });
}

export async function getUserByEmail(email: string) {
	return getUserByEmailQuery.execute({ email });
}

export async function getUserByVerificationToken(verificationToken: string) {
	return getUserByVerificationTokenQuery.execute({ verificationToken });
}

export async function getUserByPasswordResetToken(passwordResetToken: string) {
	return getUserByPasswordResetTokenQuery.execute({ passwordResetToken });
}

export async function updateUserVerificationToken(id: string, verificationToken: string) {
	id = suidToUuid(id);
	return updateUserVerificationTokenQuery.execute({ id, verificationToken });
}

export async function updateUserPasswordResetToken(id: string, passwordResetToken: string) {
	id = suidToUuid(id);
	return updateUserPasswordResetTokenQuery.execute({ id, passwordResetToken });
}

export async function updateUserProfile(data: {
	id: string;
	prefix: string;
	name: string;
	nickname: string;
	phoneNumber: string;
	schoolName: string;
	grade: number;
	addressProvince: string;
	addressDistrict: string;
	addressSubDistrict: string;
	addressPostcode: string;
	addressDetail: string;
}) {
	data.id = suidToUuid(data.id);
	return updateUserProfileQuery.execute(data);
}

export async function updateUserProfileWithTranscript(data: {
	id: string;
	prefix: string;
	name: string;
	nickname: string;
	phoneNumber: string;
	schoolName: string;
	grade: number;
	transcriptId: string;
	addressProvince: string;
	addressDistrict: string;
	addressSubDistrict: string;
	addressPostcode: string;
	addressDetail: string;
}) {
	data.id = suidToUuid(data.id);
	return updateUserProfileWithTranscriptQuery.execute(data);
}

export async function updateUserProfileRegistrationComplete(data: {
	id: string;
	prefix: string;
	name: string;
	nickname: string;
	phoneNumber: string;
	schoolName: string;
	grade: number;
	transcriptId: string;
	addressProvince: string;
	addressDistrict: string;
	addressSubDistrict: string;
	addressPostcode: string;
	addressDetail: string;
}) {
	data.id = suidToUuid(data.id);
	return updateUserProfileRegistrationCompleteQuery.execute(data);
}

export async function updateUserPassword(id: string, hashedPassword: string) {
	id = suidToUuid(id);
	return updateUserPasswordQuery.execute({ id, hashedPassword });
}
