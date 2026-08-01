export interface Question {
    question: string;
    options: string[];
    correctAnswer: number;
    marks: number;
}


export interface Worksheet {

    _id?: string;

    title: string;

    description?: string;

    classId: string;

    subject: string;

    teacherId?: string;


    questions: Question[];


    startDate: string;

    endDate: string;


    duration: number;


    totalMarks?: number;

    totalQuestions?: number;


    status:
    | "draft"
    | "published"
    | "closed";
}