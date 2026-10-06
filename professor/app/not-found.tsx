"use client"

import { useRouter } from "next/navigation";
import { useDictionary } from "@/components/i18n/provider";

export default function GoAway(){
    const router = useRouter(); 
    const t = useDictionary();
    router.push("/"); 
    return <h1 className="flex min-h-screen flex-col items-center justify-between p-24" >{t.notFound}</h1>;
}