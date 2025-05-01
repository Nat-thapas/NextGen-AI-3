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
