"use client";

import { signIn, signOut } from 'next-auth/react'; 
import { FaGoogle } from 'react-icons/fa'; 
import { useDictionary } from '@/components/i18n/provider';
import { format } from '@/helpers/i18n/dictionaries';

interface LoginProps {
    showLogin: boolean;
    user?: any;
    compact?: boolean;
}



const Login : React.FC<LoginProps> = ({ showLogin, user, compact = false }) => {
  const t = useDictionary();
  if ( user && !showLogin) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <p className={compact ? "hidden sm:block text-sm font-medium" : "text-sm font-medium"}>{format(t.welcome, { name: user.name ?? "" })}</p>
        <button
          className="auth-button"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          {t.signOut}
        </button>
      </div>
    );
  } else if (showLogin) {
    return (
      <button
        className="auth-button"
        onClick={() => signIn('google')}
      >
        <FaGoogle aria-hidden="true" className="text-blue-600" />
        {compact ? <><span className="sm:hidden">{t.signIn}</span><span className="hidden sm:inline">{t.signInWithGoogle}</span></> : t.signInWithGoogle}
      </button>
    );
  } else {
    return null;
  }
};
export default Login; 
