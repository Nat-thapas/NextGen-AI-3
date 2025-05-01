export interface Exam {
	id: string;
	title: string;
	description: string;
	openAt: Date;
	closeAt: Date;
	timeLimit: number; // seconds
	createdAt: Date;
	updatedAt: Date;
}

export interface PartialExam {
	id: string;
	title: string;
	openAt: Date;
	closeAt: Date;
	timeLimit: number;
}
