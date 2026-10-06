"use client"
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import { useState } from 'react'; 

interface SchoolCardProps {
    school: string;
}

const SchoolCard: React.FC<SchoolCardProps> = ({ school }) => {
    const router = useRouter(); 
    const [hovered, setHovered] = useState(false); 
    const schoolPageName = `/schools/${school}`;

    const handleClick = (): void => {
        router.push(schoolPageName); 
    }

    return(
        <>
            <div onClick={handleClick} onMouseEnter={() => setHovered(true)} className="bg-white mx-auto p-5 mb-9 max-w-6xl rounded-lg shadow-lg mt-5 text-xl font-bold text-center flex flex-col cursor-pointer hover:border-black hover:border-2">
                <h1>{school}</h1>    
            </div>
        
        </>
    ); 
}



export default SchoolCard;
