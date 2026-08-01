import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    useParams,
    useNavigate
} from "react-router-dom";

import {
    Clock
} from "lucide-react";



const worksheetData = {

    id: "123",

    title: "Algebra Chapter 1",

    duration: 30,


    questions: [

        {
            question: "What is 5 + 5?",
            options: [
                "8",
                "9",
                "10",
                "12"
            ]
        },


        {
            question: "What is 10 x 2?",
            options: [
                "10",
                "20",
                "30",
                "40"
            ]
        }

    ]

};



export default function TakeWorksheet() {


    const navigate = useNavigate();

    const { id } = useParams();



    const [answers, setAnswers] = useState<number[]>([]);



    const [time, setTime] = useState(
        worksheetData.duration * 60
    );




    const selectAnswer = (
        questionIndex: number,
        option: number
    ) => {


        const updatedAnswers = [
            ...answers
        ];


        updatedAnswers[questionIndex] = option;


        setAnswers(updatedAnswers);

    };





    const submitWorksheet = useCallback(() => {


        const payload = {


            worksheetId: id,


            studentId: "currentStudentId",


            answers: worksheetData.questions.map(
                (_, index) => ({

                    questionIndex: index,

                    selectedOption:
                        answers[index] ?? -1

                })
            ),


            status: "submitted"

        };



        console.log(payload);



        /*
        axios.post(
            "/api/worksheet-attempts",
            payload
        )
        */



        navigate("/student/worksheets");



    }, [
        id,
        answers,
        navigate
    ]);






    useEffect(() => {


        const timer = setInterval(() => {


            setTime(prev => {


                if (prev <= 1) {


                    clearInterval(timer);


                    submitWorksheet();


                    return 0;

                }


                return prev - 1;


            });


        }, 1000);



        return () => clearInterval(timer);



    }, [submitWorksheet]);







    const minutes = Math.floor(
        time / 60
    );


    const seconds = time % 60;




    return (

        <div className="p-6">


            <div className="
                flex
                justify-between
                items-center
                mb-6
            ">


                <h1 className="
                    text-3xl
                    font-bold
                ">

                    {worksheetData.title}

                </h1>




                <div className="
                    flex
                    items-center
                    gap-2
                    bg-red-100
                    px-4
                    py-2
                    rounded-lg
                ">

                    <Clock size={18} />


                    {minutes}:
                    {seconds
                        .toString()
                        .padStart(2, "0")}


                </div>


            </div>





            <div className="space-y-6">


                {
                    worksheetData.questions.map(
                        (q, index) => (


                            <div
                                key={index}
                                className="
                                    bg-white
                                    shadow
                                    rounded-xl
                                    p-6
                                "
                            >


                                <h2 className="
                                    font-semibold
                                    mb-4
                                ">

                                    {index + 1}. {q.question}

                                </h2>





                                <div className="space-y-3">


                                    {
                                        q.options.map(
                                            (
                                                option: string,
                                                i: number
                                            ) => (


                                                <label
                                                    key={i}
                                                    className="
                                                        flex
                                                        gap-3
                                                        items-center
                                                        cursor-pointer
                                                    "
                                                >


                                                    <input

                                                        type="radio"

                                                        name={`q-${index}`}

                                                        checked={
                                                            answers[index] === i
                                                        }

                                                        onChange={() =>
                                                            selectAnswer(
                                                                index,
                                                                i
                                                            )
                                                        }

                                                    />


                                                    {option}


                                                </label>


                                            )
                                        )
                                    }


                                </div>


                            </div>


                        )
                    )
                }


            </div>





            <button

                onClick={submitWorksheet}

                className="
                    mt-8
                    bg-green-600
                    text-white
                    px-8
                    py-3
                    rounded-lg
                "

            >

                Submit Worksheet

            </button>



        </div>

    );

}