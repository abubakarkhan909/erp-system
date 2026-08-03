declare class SecurityQuestionItemDto {
    question: string;
    answer: string;
}
export declare class SetSecurityQuestionsDto {
    questions: SecurityQuestionItemDto[];
}
export declare class SetRecoveryKeyDto {
    recoveryKey: string;
}
export {};
