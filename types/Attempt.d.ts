export interface Attempt {
    problemId: number;
    userName: string;
    dateTime: Date;
    attemptValue: string;
    attemptSuccessful: boolean | null;
}