export interface PollOption {
    id: string;
    text: string;
    voteCount: number;
}
export interface Poll {
    id: string;
    classroomId: string;
    question: string;
    options: PollOption[];
    createdAt: number;
    createdBy: string;
    isActive: boolean;
    allowMultipleAnswers: boolean;
    isAnonymous: boolean;
    showResultsLive: boolean;
}

export interface PollResponse {
    pollId: string;
    userId: string;
    userName: string;
    selectedOptionIds: string[];
    timestamp: number;
}

export interface PollResults {
    pollId: string;
    totalResponses: number;
    optionResults: {
        optionId: string;
        voteCount: number;
        text: string;
        percentage: number;
    }[];
    respondedUserIds: string[];
}


