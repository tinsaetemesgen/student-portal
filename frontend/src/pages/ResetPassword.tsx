import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Lock,
    Eye,
    EyeOff
} from "lucide-react";

import { useAppContext } from "../context/AppContext";


const ResetPassword = () => {


    const { schoolInfo } = useAppContext();


    const navigate = useNavigate();


    const [searchParams] = useSearchParams();


    const token = searchParams.get("token");



    const [password, setPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");


    const [showPassword, setShowPassword] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);


    const [loading, setLoading] = useState(false);


    const [message, setMessage] = useState("");

    const [error, setError] = useState("");




    const handleSubmit = async (
        e: React.FormEvent
    ) => {


        e.preventDefault();


        setMessage("");

        setError("");



        if (password !== confirmPassword) {

            setError(
                "Passwords do not match"
            );

            return;

        }




        if (password.length < 6) {

            setError(
                "Password must contain at least 6 characters"
            );

            return;

        }




        try {


            setLoading(true);



            await axios.post(

                "http://localhost:7000/api/auth/reset-password",

                {

                    token,

                    password

                }

            );



            setMessage(
                "Password successfully changed. Redirecting to login..."
            );



            setTimeout(() => {

                navigate("/");

            }, 2000);



        }
        catch (err: any) {


            setError(

                err.response?.data?.error ||

                "Unable to reset password"

            );


        }
        finally {

            setLoading(false);

        }


    };





    return (

        <div className="
min-h-screen
flex
items-center
justify-center
bg-gray-100
px-4
">


            <div className="
bg-white
w-full
max-w-md
rounded-2xl
shadow-md
p-8
">



                <div className="
flex
flex-col
items-center
mb-6
">


                    {
                        schoolInfo.logo ? (

                            <img

                                src={schoolInfo.logo}

                                alt={schoolInfo.name}

                                className="
w-20
h-20
rounded-full
object-contain
border-2
border-blue-200
mb-3
"

                            />

                        )

                            : (


                                <div className="
w-20
h-20
rounded-full
bg-blue-600
text-white
flex
items-center
justify-center
text-3xl
font-bold
mb-3
">

                                    {
                                        schoolInfo.name
                                            .charAt(0)
                                            .toUpperCase()
                                    }

                                </div>


                            )

                    }




                    <h2 className="
text-2xl
font-bold
text-gray-800
">

                        Reset Password

                    </h2>



                    <p className="
text-sm
text-gray-500
mt-2
text-center
">

                        Create a new password for your account

                    </p>



                </div>





                {
                    message && (

                        <div className="
mb-4
bg-green-100
text-green-700
p-3
rounded-lg
text-sm
">

                            {message}

                        </div>

                    )

                }




                {
                    error && (

                        <div className="
mb-4
bg-red-100
text-red-700
p-3
rounded-lg
text-sm
">

                            {error}

                        </div>

                    )

                }





                <form onSubmit={handleSubmit}>


                    {/* PASSWORD */}


                    <div className="
relative
mb-5
">


                        <Lock

                            size={18}

                            className="
absolute
left-3
top-1/2
-translate-y-1/2
text-gray-400
"

                        />


                        <input

                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }

                            placeholder="New Password"

                            required

                            value={password}

                            onChange={
                                (e) => setPassword(e.target.value)
                            }

                            className="
w-full
border
border-gray-300
rounded-lg
pl-10
pr-12
py-3
focus:outline-none
focus:ring-2
focus:ring-blue-500
"

                        />


                        <button

                            type="button"

                            onClick={() =>
                                setShowPassword(!showPassword)
                            }

                            className="
absolute
right-3
top-1/2
-translate-y-1/2
text-gray-500
"

                        >


                            {
                                showPassword
                                    ?
                                    <EyeOff size={18} />
                                    :
                                    <Eye size={18} />
                            }


                        </button>


                    </div>





                    {/* CONFIRM PASSWORD */}


                    <div className="
relative
mb-5
">


                        <Lock

                            size={18}

                            className="
absolute
left-3
top-1/2
-translate-y-1/2
text-gray-400
"

                        />



                        <input

                            type={
                                showConfirm
                                    ?
                                    "text"
                                    :
                                    "password"
                            }

                            placeholder="Confirm Password"

                            required

                            value={confirmPassword}

                            onChange={
                                (e) => setConfirmPassword(e.target.value)
                            }

                            className="
w-full
border
border-gray-300
rounded-lg
pl-10
pr-12
py-3
focus:outline-none
focus:ring-2
focus:ring-blue-500
"

                        />



                        <button

                            type="button"

                            onClick={() =>
                                setShowConfirm(!showConfirm)
                            }

                            className="
absolute
right-3
top-1/2
-translate-y-1/2
text-gray-500
"

                        >


                            {
                                showConfirm
                                    ?
                                    <EyeOff size={18} />
                                    :
                                    <Eye size={18} />
                            }


                        </button>


                    </div>






                    <button

                        disabled={loading}

                        className="
w-full
bg-blue-600
hover:bg-blue-700
text-white
rounded-lg
py-3
font-semibold
transition
"

                    >


                        {
                            loading
                                ?
                                "Resetting..."
                                :
                                "Reset Password"
                        }


                    </button>



                </form>





                <div className="
mt-6
text-center
">


                    <Link

                        to="/"

                        className="
text-blue-600
hover:underline
"

                    >

                        ← Back to Login

                    </Link>


                </div>




            </div>


        </div>

    );

};


export default ResetPassword;