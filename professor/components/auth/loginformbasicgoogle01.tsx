"use client";

import { signIn } from 'next-auth/react'; 
import { FaGoogle } from 'react-icons/fa'; 

interface LoginProps {
    showLogin: boolean;
    user?: any;
}



const Login : React.FC<LoginProps> = ({ showLogin, user }) => {
  if ( user && !showLogin) {
    console.log(user)
    return (
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold">Welcome, {user.name}!</h1>
      </div>
    );
  } else if (showLogin) {
    return (
      <button
        className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-300"
        onClick={() => signIn('google')}
      >
        <FaGoogle className="mr-2" />
        Sign in with Google
      </button>
    );
  } else {
    return null;
  }
};
export default Login; 
