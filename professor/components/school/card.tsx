import Link from "next/link";
import { schoolPath } from "@/helpers/links";

interface SchoolCardProps {
    school: { key: string; name: string };
}

const SchoolCard: React.FC<SchoolCardProps> = ({ school }) => (
  <Link href={schoolPath(school)} className="result-card">
    <h3>{school.name}</h3>
    <span aria-hidden="true" className="result-arrow">↗</span>
  </Link>
);
export default SchoolCard;
