export interface SurveyQuestion {
    question: string;
    votes: boolean;
}

export interface Survey {
    mainText: string;
    questionVoteText: string;
    questionOpenTest: string;
    questionsVote: SurveyQuestion[];
    questionsOpen: SurveyQuestion[];
}
