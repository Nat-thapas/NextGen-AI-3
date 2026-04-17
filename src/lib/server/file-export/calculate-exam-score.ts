import difflib from 'difflib';

import { questionTypes, scoringTypes } from '$lib/enums';
import { getAnswer, updateAnswerCorrectness } from '$lib/server/db/services/answers';
import { getExamQuestionsChoicesSubmissions } from '$lib/server/db/services/exams';
import { updateSubmissionScore } from '$lib/server/db/services/submissions';
import { getTestcases } from '$lib/server/db/services/testcases';
import { getUser } from '$lib/server/db/services/users';

import { env } from '$env/dynamic/private';

export function getScore(
	question: { minScore: number; maxScore: number },
	correctness: number
): number {
	return question.minScore + (question.maxScore - question.minScore) * correctness;
}

export function parseRegexString(regexString: string): RegExp {
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
			const answer = await getAnswer(exam.id, question.number, user.id);

			if (answer) {
				if (question.questionType === questionTypes.choices) {
					const ans = Number(answer.answer) - 1;
					answer.correctness = question.choices[ans]?.isCorrect ? 1 : 0;
				} else if (question.questionType === questionTypes.checkboxes) {
					const ans = answer.answer.split(';').map((v) => Number(v));
					if (question.scoringType === scoringTypes.exact) {
						answer.correctness = 1;
						for (const choice of question.choices) {
							if (ans.includes(choice.number) !== choice.isCorrect) {
								answer.correctness = 0;
								break;
							}
						}
					} else if (question.scoringType === scoringTypes.and) {
						answer.correctness = 1;
						for (const choice of question.choices) {
							if (choice.isCorrect && !ans.includes(choice.number)) {
								answer.correctness = 0;
								break;
							}
						}
					} else if (question.scoringType === scoringTypes.or) {
						answer.correctness = 0;
						for (const choice of question.choices) {
							if (choice.isCorrect && ans.includes(choice.number)) {
								answer.correctness = 1;
								break;
							}
						}
					} else if (question.scoringType === scoringTypes.scale) {
						let correctCount = 0;
						for (const choice of question.choices) {
							if (ans.includes(choice.number) === choice.isCorrect) {
								correctCount += 1;
							}
						}
						answer.correctness = correctCount / question.choices.length;
					} else {
						throw Error(`Question #${question.number} contains invalid scoring type`);
					}
				} else if (question.questionType === questionTypes.text) {
					const ans = answer.answer;
					if (question.textCorrect !== null) {
						if (question.scoringType === scoringTypes.exact) {
							answer.correctness = ans === question.textCorrect ? 1 : 0;
						} else if (question.scoringType === scoringTypes.scale) {
							const sequenceMatcher = new difflib.SequenceMatcher(null, question.textCorrect, ans);
							answer.correctness = sequenceMatcher.ratio();
						} else if (question.scoringType === scoringTypes.regex) {
							let regex;
							try {
								regex = parseRegexString(question.textCorrect);
							} catch {
								throw Error(`Question #${question.number} contains invalid regex`);
							}
							answer.correctness = regex.test(ans) ? 1 : 0;
						} else if (question.scoringType === scoringTypes.range) {
							const matches = question.textCorrect.matchAll(
								/^([+-]?(?:[0-9]*[.])?[0-9]+)-([+-]?(?:[0-9]*[.])?[0-9]+)$/g
							);
							const [match] = matches;
							if (
								match === null ||
								match === undefined ||
								!isFinite(parseFloat(match[1])) ||
								!isFinite(parseFloat(match[2]))
							) {
								throw Error(`Question #${question.number} contains invalid range`);
							}
							const start = parseFloat(match[1]);
							const end = parseFloat(match[2]);
							const ansNumber = parseFloat(ans);
							answer.correctness =
								isFinite(ansNumber) && start <= ansNumber && ansNumber <= end ? 1 : 0;
						} else {
							throw Error(`Question #${question.number} contains invalid scoring type`);
						}
					}
				} else if (question.questionType === questionTypes.code) {
					
					// 1. Fetch testcases from DB for this question
					const testcases = await getTestcases(exam.id, question.number);

					if (testcases && testcases.length > 0) {
						// 2. Prepare cases payload for execution API
						const casesPayload = testcases.map((tc) => ({
							input: tc.stdin || ""
						}));

						const executionPayload = {
							version: "3.12",
							submission: answer.answer, // The student's code
							colored_diagnostics: false,
							stdio_sets: [
								{
									isolation_level: "high", // Or medium based on your needs
									cases: casesPayload
								}
							]
						};

						try {
							// 3. Post to execution engine
							const response = await fetch(`${env.EXECUTOR_BASE_URL}/python/execute`, {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify(executionPayload)
							});

							if (!response.ok) {
								throw new Error(`Engine returned status ${response.status}`);
							}

							const result = await response.json();
							
							// 4. Parse the outputs (matching the single stdio_set we sent)
							const runOutputs = result.outputs?.[0] || [];
							
							let correctCount = 0;

							for (let i = 0; i < testcases.length; i++) {
								const tc = testcases[i];
								const runOut = runOutputs[i];

								// Ensure it ran successfully ("OK")
								if (runOut && runOut.status === "OK") {
									// Sanitize line endings and trim trailing whitespace to prevent \r\n vs \n errors
									const expected = (tc.expectedOut || "").trim().replace(/\r\n/g, '\n');
									const actual = (runOut.output || "").trim().replace(/\r\n/g, '\n');

									if (actual === expected) {
										correctCount += 1;
									}
								}
							}

							// Calculate correctness ratio
							answer.correctness = correctCount / testcases.length;

						} catch (err) {
							console.error(`Execution failed for user ${user.id}, question ${question.number}:`, err);
							// Set to 0 if the API is down or crashes 
							answer.correctness = 0; 
						}
					} else {
						answer.correctness = 1;
					}
				}
				if (answer.correctness === null) {
					score += question.defaultScore;
				} else {
					score += getScore(question, answer.correctness);
				}

				await updateAnswerCorrectness(exam.id, question.number, user.id, answer.correctness);
			} else {
				score += question.defaultScore;
			}
		}

		await updateSubmissionScore(exam.id, user.id, score);
	}
}