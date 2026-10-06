"use client"

import { useRouter } from "next/navigation";

export default function GoAway(){
    const router = useRouter(); 
    router.push("/"); 
    return <h1 className="flex min-h-screen flex-col items-center justify-between p-24" >You Seem to have found a page that does not exist. Lets send you home</h1>;
}