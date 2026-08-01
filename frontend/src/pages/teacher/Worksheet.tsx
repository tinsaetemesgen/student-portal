import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";



const worksheets = [

    {
        title: "Algebra Chapter 1",
        subject: "Math",
        className: "Grade 9",
        questions: 20,
        status: "published"
    },

    {
        title: "Physics Practice",
        subject: "Physics",
        className: "Grade 10",
        questions: 15,
        status: "draft"
    }

];



export default function Worksheets() {


    const navigate = useNavigate();


    return (

        <div className="p-6">


            <div className="
flex
justify-between
mb-6
">


                <h1 className="
text-3xl
font-bold
">

                    Worksheets

                </h1>



                <button

                    onClick={() =>
                        navigate("/teacher/create-worksheet")
                    }

                    className="
bg-blue-600
text-white
px-4
py-2
rounded-lg
flex
gap-2
items-center
"

                >

                    <Plus size={18} />

                    Create Worksheet

                </button>


            </div>



            <div className="
bg-white
rounded-xl
shadow
overflow-hidden
">


                <table className="w-full">


                    <thead className="bg-gray-100">


                        <tr>

                            <th className="p-3 text-left">
                                Title
                            </th>

                            <th>
                                Class
                            </th>

                            <th>
                                Subject
                            </th>

                            <th>
                                Questions
                            </th>

                            <th>
                                Status
                            </th>

                        </tr>


                    </thead>


                    <tbody>


                        {
                            worksheets.map((w, i) => (


                                <tr
                                    key={i}
                                    className="border-t"
                                >


                                    <td className="p-3">
                                        {w.title}
                                    </td>


                                    <td>
                                        {w.className}
                                    </td>


                                    <td>
                                        {w.subject}
                                    </td>


                                    <td>
                                        {w.questions}
                                    </td>


                                    <td>

                                        <span className="
px-3
py-1
rounded-full
bg-green-100
">

                                            {w.status}

                                        </span>

                                    </td>


                                </tr>


                            ))

                        }



                    </tbody>


                </table>


            </div>


        </div>


    )

}