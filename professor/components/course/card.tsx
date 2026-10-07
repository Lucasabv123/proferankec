import ArrowIcon from "@/components/util/arrowIcon";
import Link from "next/link";
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

const CourseCard = ({ course }: CourseCardProps) => (
  <Link href={coursePath(course)} className="result-card">
    <h3>{course.code ? `${course.code} ` : ""}{course.name}</h3>
    {course.school && <p>{course.school.name}</p>}
    <p>{course.Department}</p>
    <ArrowIcon className="result-arrow" />
  </Link>
);
export default CourseCard;
