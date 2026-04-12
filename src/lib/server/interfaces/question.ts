export interface QuestionSchema {
	questionType: 'choices' | 'checkboxes' | 'text' | 'file' | 'code';
	textLengthLimit: number;
	fileTypes: string | null;
	fileSizeLimit: number;
}
