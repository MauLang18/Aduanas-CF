import { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import LandingIntro from './LandingIntro';
import ErrorText from '../../components/Typography/ErrorText';
import InputText from '../../components/Input/InputText';

function Login() {
    const INITIAL_LOGIN_OBJ = {
        password: "",
        emailId: ""
    };

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loginObj, setLoginObj] = useState(INITIAL_LOGIN_OBJ);

    const submitForm = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (loginObj.emailId.trim() === "") return setErrorMessage("Email Id is required! (use any value)");
        if (loginObj.password.trim() === "") return setErrorMessage("Password is required! (use any value)");

        try {
            setLoading(true);

            const response = await axios.post('https://api.logisticacastrofallas.com/api/Auth/Login?authType=Interno', {
                correo: loginObj.emailId,
                pass: loginObj.password
            });

            if (response.data.isSuccess) {
                const token = response.data.data;

                const decodedToken = jwtDecode(token);

                const givenName = decodedToken.given_name;
                const typ = decodedToken.typ;

                console.log(givenName, typ)

                if ((givenName === "1" || givenName === "3") && typ.includes("11")) {
                    localStorage.setItem("token", token);
                    window.location.href = '/app/dashboard';
                } else {
                    setErrorMessage('Invalid user credentials. Access denied.');
                }
            } else {
                setErrorMessage(response.data.message || 'Invalid credentials');
            }

        } catch (error) {
            setErrorMessage('Error during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateFormValue = ({ updateType, value }) => {
        setErrorMessage("");
        setLoginObj({ ...loginObj, [updateType]: value });
    };

    return (
        <div className="min-h-screen bg-base-200 flex items-center">
            <div className="card mx-auto w-full max-w-5xl shadow-xl">
                <div className="grid md:grid-cols-2 grid-cols-1 bg-base-100 rounded-xl">
                    <div className=''>
                        <LandingIntro />
                    </div>
                    <div className='py-24 px-10'>
                        <h2 className='text-2xl font-semibold mb-2 text-center'>Login</h2>
                        <form onSubmit={submitForm}>
                            <div className="mb-4">
                                <InputText 
                                    type="emailId" 
                                    defaultValue={loginObj.emailId} 
                                    updateType="emailId" 
                                    containerStyle="mt-4" 
                                    labelTitle="Email Id" 
                                    updateFormValue={updateFormValue}
                                />
                                <InputText 
                                    defaultValue={loginObj.password} 
                                    type="password" 
                                    updateType="password" 
                                    containerStyle="mt-4" 
                                    labelTitle="Password" 
                                    updateFormValue={updateFormValue}
                                />
                            </div>

                            <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>
                            <button type="submit" className={"btn mt-2 w-full btn-primary" + (loading ? " loading" : "")}>
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
