/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { and, asc, desc, eq, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { leaderboards, leaderboardsToExams, submissions, users } from '$lib/server/db/schema';

import { suidToUuid } from '../suid';

const createLeaderboardReturningQuery = db
	.insert(leaderboards)
	.values({
		name: sql.placeholder('name'),
		order: sql.placeholder('order')
	})
	.returning()
	.prepare('create_leaderboard');

const getLeaderboardQuery = db.query.leaderboards
	.findFirst({
		where: eq(leaderboards.id, sql.placeholder('id'))
	})
	.prepare('get_leaderboard');

const getLeaderboardScoresQuery = db
	.select({
		user: {
			id: users.id,
			prefix: users.prefix,
			name: users.name
		},
		score: sql<string>`sum(${submissions.score})`.mapWith(Number).as('score')
	})
	.from(leaderboards)
	.innerJoin(leaderboardsToExams, eq(leaderboardsToExams.leaderboardId, leaderboards.id))
	.innerJoin(submissions, eq(submissions.examId, leaderboardsToExams.examId))
	.innerJoin(users, eq(users.id, submissions.userId))
	.where(eq(leaderboards.id, sql.placeholder('id')))
	.groupBy(users.id)
	.orderBy(desc(sql`score`))
	.limit(sql.placeholder('limit'))
	.prepare('get_leaderboard_scores');

const getUserScoreQuery = db
	.select({
		score: sql<string>`sum(${submissions.score})`.mapWith(Number).as('score')
	})
	.from(leaderboards)
	.innerJoin(leaderboardsToExams, eq(leaderboardsToExams.leaderboardId, leaderboards.id))
	.innerJoin(
		submissions,
		and(
			eq(submissions.examId, leaderboardsToExams.examId),
			eq(submissions.userId, sql.placeholder('userId'))
		)
	)
	.prepare('get_user_score');

const getLeaderboardsQuery = db.query.leaderboards
	.findMany({
		columns: {
			id: true,
			name: true,
			order: true
		},
		with: {
			leaderboardsToExams: {
				columns: {},
				with: {
					exams: {
						columns: {
							id: true
						}
					}
				}
			}
		},
		orderBy: [asc(leaderboards.order), asc(leaderboards.name)]
	})
	.prepare('get_leaderboards');

const updateLeaderboardQuery = db
	.update(leaderboards)
	.set({
		name: sql.placeholder('name'),
		order: sql.placeholder('order')
	})
	.where(eq(leaderboards.id, sql.placeholder('id')))
	.prepare('update_leaderboard');

const deleteLeaderboardQuery = db
	.delete(leaderboards)
	.where(eq(leaderboards.id, sql.placeholder('id')))
	.prepare('delete_leaderboard');

export async function createLeaderboardReturning(name: string, order: number) {
	return (await createLeaderboardReturningQuery.execute({ name, order }))[0];
}

export async function getLeaderboard(id: string) {
	id = suidToUuid(id);
	return getLeaderboardQuery.execute({ id });
}

export async function getLeaderboardScores(id: string, limit: number) {
	id = suidToUuid(id);
	return getLeaderboardScoresQuery.execute({ id, limit });
}

export async function getUserScore(userId: string) {
	userId = suidToUuid(userId);
	return (await getUserScoreQuery.execute({ userId }))[0].score;
}

export async function getLeaderboards() {
	return getLeaderboardsQuery.execute();
}

export async function updateLeaderboard(id: string, name: string, order: number) {
	id = suidToUuid(id);
	return updateLeaderboardQuery.execute({ id, name, order });
}

export async function deleteLeaderboard(id: string) {
	id = suidToUuid(id);
	return deleteLeaderboardQuery.execute({ id });
}
