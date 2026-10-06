import { redirect } from "next/navigation"; 
import { getServerSession } from "next-auth/next"; 
import authOptions from "@/helpers/auth/options";


const SignOutBase : React.FC = async () => {
    const session = getServerSession(authOptions);

    if(!session){
        redirect("/api/auth/signin");
    } else{
        await fetch("/api/auth/signout", {
            method: "POST", 
            headers: {
                "Content-Type": "application/json"
            },

        }); 
        redirect("/"); 
    }
    



}
export default SignOutBase;