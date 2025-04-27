export interface QuestionSchema {
	questionType: 'choices' | 'checkboxes' | 'text' | 'file';
	textLengthLimit: number;
	fileTypes: string | null;
	fileSizeLimit: number;
}
