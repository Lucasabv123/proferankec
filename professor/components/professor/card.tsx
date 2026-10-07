import ArrowIcon from "@/components/util/arrowIcon";
import Link from "next/link";
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

const ProfessorCard: React.FC<ProfessorCardProps> = ({ professor }) => (
  <Link href={professorPath(professor)} className="result-card">
    <h3>{professor.Prefix} {professor.Firstname} {professor.Lastname}</h3>
    <ArrowIcon className="result-arrow" />
  </Link>
);
export default ProfessorCard;
