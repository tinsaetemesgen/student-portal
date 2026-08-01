import { Plus } from "lucide-react";
import QuestionCard from "./QuestionCard";
import type { Question } from "../../types/Worksheet";



interface Props {

    questions: Question[];

    setQuestions:
    React.Dispatch<
        React.SetStateAction<Question[]>
    >;

}



export default function QuestionBuilder({
    questions,
    setQuestions

}: Props) {



    function addQuestion() {


        setQuestions([
            ...questions,

            {
                question: "",
                options: [
                    "",
                    "",
                    "",
                    ""
                ],
                correctAnswer: 0,
                marks: 1
            }

        ])

    }



    function updateQuestion(
        index: number,
        data: Question
    ) {

        const updated = [...questions];

        updated[index] = data;

        setQuestions(updated);

    }



    function removeQuestion(index: number) {

        setQuestions(
            questions.filter(
                (_, i) => i !== index
            )
        )

    }



    return (

        <div className="space-y-5">


            <div className="
flex
justify-between
items-center
">

                <h2 className="
text-xl
font-bold
">

                    Questions

                </h2>


                <button

                    onClick={addQuestion}

                    className="
flex
items-center
gap-2
bg-blue-600
text-white
px-4
py-2
rounded-lg
"

                >


                    <Plus size={18} />

                    Add Question


                </button>


            </div>



            {
                questions.map(
                    (q, i) => (

                        <QuestionCard

                            key={i}

                            question={q}

                            index={i}

                            updateQuestion={updateQuestion}

                            removeQuestion={removeQuestion}

                        />

                    )
                )

            }



        </div>


    )

}