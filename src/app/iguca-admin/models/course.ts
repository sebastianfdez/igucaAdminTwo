export class IgucaQuestion {
    a: string;
    b: string;
    c: string;
    d: string;
    e: string;
    f: string;
    g: string;
    h: string;
    correct: string; // correct answer of the question
    question: string;
    number: number;
    answer: string;
    alternatives: boolean;
    hasFile: boolean;
  }

  export class IgucaCourse {
    key?: string;
    finalExam: IgucaQuestion[] = [];
    finalExamOpen: IgucaQuestion[] = [];
    name: string;
    expireDate: number;
    description: string;
    alternatives = true;
}
