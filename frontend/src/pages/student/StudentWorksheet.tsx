import { FileQuestion, Clock, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";


const worksheets = [
    {
        id: "123",
        title: "Algebra Chapter 1",
        subject: "Mathematics",
        questions: 20,
        duration: 30,
        status: "Available"
    },

    {
        id: "456",
        title: "Physics Motion Quiz",
        subject: "Physics",
        questions: 15,
        duration: 45,
        status: "Available"
    }
];


export default function StudentWorksheet() {

    const navigate = useNavigate();


    return (

        <div className="p-6">


            <h1 className="
text-3xl
font-bold
mb-6
">

                My Worksheets

            </h1>



            <div className="
grid
md:grid-cols-2
gap-6
">


                {
                    worksheets.map((worksheet) => (


                        <div

                            key={worksheet.id}

                            className="
bg-white
rounded-xl
shadow
p-6
space-y-4
"

                        >


                            <div className="
flex
items-center
gap-3
">


                                <div className="
bg-blue-100
p-3
rounded-lg
">

                                    <FileQuestion
                                        className="text-blue-600"
                                    />

                                </div>



                                <div>

                                    <h2 className="font-bold text-lg">

                                        {worksheet.title}

                                    </h2>


                                    <p className="text-gray-500">

                                        {worksheet.subject}

                                    </p>


                                </div>


                            </div>




                            <div className="
flex
justify-between
text-sm
text-gray-600
">


                                <span>

                                    Questions:
                                    {worksheet.questions}

                                </span>



                                <span className="
flex
items-center
gap-1
">

                                    <Clock size={16} />

                                    {worksheet.duration} min

                                </span>


                            </div>



                            <button

                                onClick={() => navigate(
                                    `/student/worksheet/${worksheet.id}`
                                )}

                                className="
w-full
bg-blue-600
text-white
py-2
rounded-lg
flex
justify-center
items-center
gap-2
"

                            >


                                <Play size={18} />

                                Start Worksheet


                            </button>



                        </div>


                    ))

                }


            </div>


        </div>


    )

}