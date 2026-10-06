"use client"

import { useRouter } from "next/navigation"; 
import { useState } from "react";
import { professorPath } from "@/helpers/links";

type Professor = {
  id: number;
  Firstname?: string;
  Lastname?: string;
  Prefix?: string;
  Verified?: boolean;
};


interface ProfessorCardProps{
    professor: Professor;

}

const ProfessorCard : React.FC<ProfessorCardProps> = ({ professor }) => {
  const router = useRouter();
  const professorPageName = professorPath(professor);
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    router.push(professorPageName);
  };


  return (
    <>
      <div onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}onClick={handleClick} className="bg-white mx-auto p-5 mb-9 max-w-6x1 rounded-lg shadow-lg mt-5 text-xl font-bold text-center flex flex-col cursor-pointer hover:border-black hover:border-2">
        <h1>{professor.Prefix} {professor.Firstname} {professor.Lastname}</h1>
    </div>
    
    </>
  );
};

export default ProfessorCard;
