import type { Exam } from '$lib/server/interfaces/exam';

export interface Question {
	examId: string;
	exam?: Exam;
	number: number;
	markdown: string;
	html: string;
	questionType: 'choices' | 'checkboxes' | 'text' | 'file';
	maxScore: number;
	minScore: number;
	scoringType: 'exact' | 'regex' | 'and' | 'or' | 'scale' | null;
	textLengthLimit: number | null;
	textCorrect: string | null;
	fileTypes: string | null;
	fileSizeLimit: number | null;
	createdAt: Date;
	updatedAt: Date;
}
