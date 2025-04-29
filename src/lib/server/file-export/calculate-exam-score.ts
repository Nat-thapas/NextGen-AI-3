import difflib from 'difflib';

import { questionTypes, scoringTypes } from '$lib/enums';
import { deleteAnswer, getAnswer, updateAnswerCorrectness } from '$lib/server/db/services/answers';
import { getExamQuestionsChoicesSubmissions } from '$lib/server/db/services/exams';
import { updateSubmissionScore } from '$lib/server/db/services/submissions';
import { getUser } from '$lib/server/db/services/users';

function getScore(question: { minScore: number; maxScore: number }, correctness: number): number {
	return question.minScore + (question.maxScore - question.minScore) * correctness;
}

function parseRegexString(regexString: string): RegExp {
	const regexMatcher = /^\/(.*)\/([gimyus]*)$/;
	const match = regexString.match(regexMatcher);

	if (match) {
		const pattern = match[1];
		const flags = match[2];
		return new RegExp(pattern, flags);
	} else {
		return new RegExp(regexString);
	}
}

export async function calculateExamScore(examId: string): Promise<void> {
	const exam = await getExamQuestionsChoicesSubmissions(examId);

	if (!exam) {
		throw Error('Exam not found');
	}

	for (const submission of exam.submissions) {
		const user = await getUser(submission.userId);
		if (!user) continue;

		let score = 0;

		for (const question of exam.questions) {
			let correctness: number | null = null;

			const answer = await getAnswer(exam.id, question.number, user.id);
			if (!answer) {
				score += question.defaultScore;
				continue;
			}

			if (question.questionType === questionTypes.choices) {
				const ans = Number(answer.answer) - 1;
				correctness = question.choices[ans]?.isCorrect ? 1 : 0;
				score += getScore(question, correctness);
			} else if (question.questionType === questionTypes.checkboxes) {
				const ans = answer.answer.split(';').map((v) => Number(v));
				if (question.scoringType === scoringTypes.exact) {
					correctness = 1;
					for (const choice of question.choices) {
						if (ans.includes(choice.number) !== choice.isCorrect) {
							correctness = 0;
							break;
						}
					}
					score += getScore(question, correctness);
				} else if (question.scoringType === scoringTypes.and) {
					correctness = 1;
					for (const choice of question.choices) {
						if (choice.isCorrect && !ans.includes(choice.number)) {
							correctness = 0;
							break;
						}
					}
					score += getScore(question, correctness);
				} else if (question.scoringType === scoringTypes.or) {
					correctness = 0;
					for (const choice of question.choices) {
						if (choice.isCorrect && ans.includes(choice.number)) {
							correctness = 1;
							break;
						}
					}
					score += getScore(question, correctness);
				} else if (question.scoringType === scoringTypes.scale) {
					let correctCount = 0;
					for (const choice of question.choices) {
						if (ans.includes(choice.number) === choice.isCorrect) {
							correctCount += 1;
						}
					}
					correctness = correctCount / question.choices.length;
					score += getScore(question, correctness);
				} else {
					throw Error(`Question #${question.number} contains invalid scoring type`);
				}
			} else if (question.questionType === questionTypes.text) {
				const ans = answer.answer;
				if (question.textCorrect === null) {
					score += question.defaultScore;
				} else {
					if (question.scoringType === scoringTypes.exact) {
						correctness = ans === question.textCorrect ? 1 : 0;
						score += getScore(question, correctness);
					} else if (question.scoringType === scoringTypes.scale) {
						const sequenceMatcher = new difflib.SequenceMatcher(null, question.textCorrect, ans);
						correctness = sequenceMatcher.ratio();
						score += getScore(question, correctness);
					} else if (question.scoringType === scoringTypes.regex) {
						let regex;
						try {
							regex = parseRegexString(question.textCorrect);
						} catch {
							throw Error(`Question #${question.number} contains invalid regex`);
						}
						correctness = regex.test(ans) ? 1 : 0;
						score += getScore(question, correctness);
					} else {
						throw Error(`Question #${question.number} contains invalid scoring type`);
					}
				}
			} else {
				score += question.defaultScore;
			}

			await updateAnswerCorrectness(exam.id, question.number, user.id, correctness);
		}

		await updateSubmissionScore(exam.id, user.id, score);
	}
}
