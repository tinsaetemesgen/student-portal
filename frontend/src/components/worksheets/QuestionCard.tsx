import { Trash2 } from "lucide-react";
import type { Question } from "../../types/Worksheet";

interface Props {

    question: Question;

    index: number;

    updateQuestion:
    (
        index: number,
        data: Question
    ) => void;


    removeQuestion:
    (index: number) => void;
}



export default function QuestionCard({
    question,
    index,
    updateQuestion,
    removeQuestion

}: Props) {


    function updateField(
        field: keyof Question,
        value: string | number | string[]
    ) {

        updateQuestion(
            index,
            {
                ...question,
                [field]: value
            }
        )

    }



    function updateOption(
        optionIndex: number,
        value: string
    ) {

        const options = [...question.options];

        options[optionIndex] = value;


        updateField(
            "options",
            options
        );

    }



    return (

        <div className="
bg-white
rounded-xl
shadow
p-5
space-y-4
border
">


            <div className="
flex
justify-between
items-center
">

                <h3 className="font-semibold">
                    Question {index + 1}
                </h3>


                <button
                    onClick={() => removeQuestion(index)}
                    className="text-red-500"
                >

                    <Trash2 size={18} />

                </button>

            </div>




            <textarea

                value={question.question}

                onChange={(e) =>
                    updateField(
                        "question",
                        e.target.value
                    )}

                placeholder="Enter question"

                className="
w-full
border
rounded-lg
p-3
"
            />



            <div className="space-y-2">


                {
                    question.options.map(
                        (option, i) => (


                            <input

                                key={i}

                                value={option}

                                onChange={(e) =>
                                    updateOption(
                                        i,
                                        e.target.value
                                    )}

                                placeholder={`Option ${i + 1}`}

                                className="
w-full
border
rounded-lg
p-2
"

                            />


                        )
                    )

                }


            </div>



            <div className="
flex
gap-5
">


                <select

                    value={question.correctAnswer}

                    onChange={(e) =>
                        updateField(
                            "correctAnswer",
                            Number(e.target.value)
                        )}

                    className="
border
rounded-lg
p-2
"

                >


                    {
                        question.options.map(
                            (_, i) => (

                                <option
                                    key={i}
                                    value={i}
                                >

                                    Correct option {i + 1}

                                </option>

                            )
                        )
                    }


                </select>



                <input

                    type="number"

                    min={1}

                    value={question.marks}

                    onChange={(e) =>
                        updateField(
                            "marks",
                            Number(e.target.value)
                        )}

                    className="
border
rounded-lg
p-2
w-24
"

                />


            </div>



        </div>


    )

}