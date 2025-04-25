export interface Exam {
	id: string;
	title: string;
	description: string;
	openAt: Date;
	closeAt: Date;
	timeLimit: number; // seconds
	scoreConfirmed: boolean;
	createdAt: Date;
	updatedAt: Date;
}
