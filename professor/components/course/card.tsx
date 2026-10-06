"use client"

import { useRouter } from "next/navigation"; 
import { useState } from "react";

type Course = {
    name: string; 
    School: string;
    Department: string; 
}

interface CourseCardProps{
    course: Course; 
}

 const CourseCard = ({ course }) => {
    const router = useRouter();
    const coursePageName = '/courses/' + course.name + '-' + course.School + '-' + course.Department; 
    const [hovered, setHovered] = useState(false);

    

    const handleClick = () =>{
        console.log(`course name: ${course.name} school: ${course.School} department: ${course.Department}`);
        router.push(coursePageName); 
    }
 

    return (
        <div onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)} onClick = {handleClick} className = "bg-white mx-auto p-5 mb-9 max-w-6x1 rounded-lg shadow-lg mt-5 text-xl font-bold text-center flex flex-col cursor-pointer hover:border-black hover:border-2">
            <h1>{course.name}</h1>
            <h1 className="text-sm"> {course.School}</h1>
            <h1 className="text-sm"> {course.Department}</h1>
        </div>
    )
}   
export default CourseCard;