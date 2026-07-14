export declare class ForgotQuestionsDto {
    username: string;
}
declare class AnswerItemDto {
    questionId: string;
    answer: string;
}
export declare class ResetWithAnswersDto {
    username: string;
    answers: AnswerItemDto[];
    newPassword: string;
}
export declare class ResetWithRecoveryKeyDto {
    username: string;
    recoveryKey: string;
    newPassword: string;
}
export {};
