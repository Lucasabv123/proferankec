"use client";

import { signIn, signOut } from 'next-auth/react'; 
import { FaGoogle } from 'react-icons/fa'; 
import { useDictionary } from '@/components/i18n/provider';
import { format } from '@/helpers/i18n/dictionaries';

interface LoginProps {
    showLogin: boolean;
    user?: any;
    compact?: boolean; // smaller buttons for the page header
}



const Login : React.FC<LoginProps> = ({ showLogin, user, compact = false }) => {
  const t = useDictionary();
  if ( user && !showLogin) {
    return (
      <div className="flex items-center gap-3">
        <h1 className={compact ? "hidden sm:block text-sm font-semibold" : "text-lg font-semibold"}>{format(t.welcome, { name: user.name ?? "" })}</h1>
        <button
          className="whitespace-nowrap px-4 py-2 bg-white text-blue-700 rounded-lg shadow hover:bg-gray-100 transition-colors duration-300"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          {t.signOut}
        </button>
      </div>
    );
  } else if (showLogin) {
    return (
      <button
        className={`flex items-center whitespace-nowrap ${compact ? "px-3 py-2 text-sm" : "px-6 py-3"} bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-300`}
        onClick={() => signIn('google')}
      >
        <FaGoogle className="mr-2" />
        {compact ? (
          <>
            <span className="sm:hidden">{t.signIn}</span>
            <span className="hidden sm:inline">{t.signInWithGoogle}</span>
          </>
        ) : t.signInWithGoogle}
      </button>
    );
  } else {
    return null;
  }
};
export default Login; 
