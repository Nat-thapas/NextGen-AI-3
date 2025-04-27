export interface Question {
	number: number;
	html: string;
	questionType: 'choices' | 'checkboxes' | 'text' | 'file';
	textLengthLimit: number;
	fileTypes: string | null;
	fileSizeLimit: number;
	choices: {
		number: number;
		html: string;
	}[];
}

export interface PartialQuestionAnswer {
	number: number;
	answers: {
		questionNumber: number;
	}[];
}
