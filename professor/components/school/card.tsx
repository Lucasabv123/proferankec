"use client"
import { useRouter } from 'next/navigation';
import { useState } from 'react'; 
import { schoolPath } from '@/helpers/links';

interface SchoolCardProps {
    school: { key: string; name: string };
}

const SchoolCard: React.FC<SchoolCardProps> = ({ school }) => {
    const router = useRouter(); 
    const [hovered, setHovered] = useState(false); 
    const schoolPageName = schoolPath(school);

    const handleClick = (): void => {
        router.push(schoolPageName); 
    }

    return(
        <>
            <div onClick={handleClick} onMouseEnter={() => setHovered(true)} className="bg-white w-full p-4 my-2 rounded-lg shadow-lg text-xl font-bold text-center flex flex-col cursor-pointer hover:border-black hover:border-2">
                <h1>{school.name}</h1>    
            </div>
        
        </>
    ); 
}



export default SchoolCard;
