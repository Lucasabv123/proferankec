"use client"

import { useRouter } from "next/navigation"; 
import { useState } from "react";
import { coursePath } from "@/helpers/links";

type Course = {
    id: number;
    code?: string | null;
    name: string; 
    Department: string; 
    school?: { name: string } | null;
}

interface CourseCardProps{
    course: Course; 
}

 const CourseCard = ({ course }: CourseCardProps) => {
    const router = useRouter();
    const coursePageName = coursePath(course);
    const [hovered, setHovered] = useState(false);

    

    const handleClick = () =>{
        router.push(coursePageName); 
    }
 

    return (
        <div onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)} onClick = {handleClick} className = "bg-white mx-auto p-5 mb-9 max-w-6x1 rounded-lg shadow-lg mt-5 text-xl font-bold text-center flex flex-col cursor-pointer hover:border-black hover:border-2">
            <h1>{course.code ? `${course.code} ` : ""}{course.name}</h1>
            {course.school ? <h1 className="text-sm"> {course.school.name}</h1> : null}
            <h1 className="text-sm"> {course.Department}</h1>
        </div>
    )
}   
export default CourseCard;