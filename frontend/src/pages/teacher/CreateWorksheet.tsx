import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionBuilder from "../../components/worksheets/QuestionBuilder";
import type { Question } from "../../types/Worksheet";
import { Save, Send } from "lucide-react";


export default function CreateWorksheet() {

    const navigate = useNavigate();


    const [questions, setQuestions] = useState<Question[]>([
        {
            question: "",
            options: ["", "", "", ""],
            correctAnswer: 0,
            marks: 1
        }
    ]);


    const [worksheet, setWorksheet] = useState({

        title: "",
        description: "",
        classId: "",
        subject: "",
        startDate: "",
        endDate: "",
        duration: 30,
        status: "draft"

    });



    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {

        setWorksheet({
            ...worksheet,
            [e.target.name]: e.target.value
        });

    };



    const submitWorksheet = (
        status: "draft" | "published"
    ) => {


        const payload = {

            ...worksheet,

            status,

            questions,

            totalQuestions:
                questions.length,


            totalMarks:
                questions.reduce(
                    (total, q) => total + q.marks,
                    0
                )

        };


        console.log(payload);


        /*
        axios.post(
          "/api/worksheets",
          payload
        )
        */


        navigate("/teacher/worksheets");

    };




    return (

        <div className="p-6 space-y-8">


            <div>

                <h1 className="
text-3xl
font-bold
">

                    Create Worksheet

                </h1>


                <p className="text-gray-500">

                    Create an online assessment for students

                </p>

            </div>



            {/* INFORMATION */}

            <div className="
bg-white
rounded-xl
shadow
p-6
space-y-5
">


                <h2 className="text-xl font-semibold">

                    Worksheet Information

                </h2>



                <input

                    name="title"

                    placeholder="Worksheet title"

                    onChange={handleChange}

                    className="
border
rounded-lg
p-3
w-full
"

                />



                <textarea

                    name="description"

                    placeholder="Description"

                    onChange={handleChange}

                    className="
border
rounded-lg
p-3
w-full
h-24
"

                />



                <div className="
grid
md:grid-cols-2
gap-4
">


                    <input

                        name="classId"

                        placeholder="Class ID"

                        onChange={handleChange}

                        className="border p-3 rounded-lg"

                    />


                    <input

                        name="subject"

                        placeholder="Subject"

                        onChange={handleChange}

                        className="border p-3 rounded-lg"

                    />



                    <input

                        type="datetime-local"

                        name="startDate"

                        onChange={handleChange}

                        className="border p-3 rounded-lg"

                    />



                    <input

                        type="datetime-local"

                        name="endDate"

                        onChange={handleChange}

                        className="border p-3 rounded-lg"

                    />



                    <input

                        type="number"

                        name="duration"

                        placeholder="Duration minutes"

                        defaultValue={30}

                        onChange={handleChange}

                        className="border p-3 rounded-lg"

                    />


                </div>


            </div>





            {/* QUESTIONS */}

            <QuestionBuilder

                questions={questions}

                setQuestions={setQuestions}

            />




            <div className="
flex
gap-4
">


                <button

                    onClick={() => submitWorksheet("draft")}

                    className="
border
px-5
py-3
rounded-lg
flex
gap-2
items-center
"

                >

                    <Save size={18} />

                    Save Draft

                </button>



                <button

                    onClick={() => submitWorksheet("published")}

                    className="
bg-blue-600
text-white
px-5
py-3
rounded-lg
flex
gap-2
items-center
"

                >

                    <Send size={18} />

                    Publish

                </button>


            </div>



        </div>

    );

}