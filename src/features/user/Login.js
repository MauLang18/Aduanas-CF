import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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

            // Hacer la petición POST al API para el login
            const response = await axios.post('http://localhost:5218/api/Auth/Login?authType=Interno', {
                correo: loginObj.emailId,
                pass: loginObj.password
            });

            if (response.data.isSuccess) {
                // Guardar token en localStorage
                localStorage.setItem("token", response.data.token);
                window.location.href = '/app/dashboard';
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
