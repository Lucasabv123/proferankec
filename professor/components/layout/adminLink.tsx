import Link from "next/link";
import { getCurrentUser } from "@/helpers/auth/currentUser";
import { getDictionary } from "@/helpers/i18n/locale";

// link to /admin, shown only to admins (User.isAdmin); renders nothing for everyone else
const AdminLink = async () => {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return null;
  const t = getDictionary();
  return (
    <Link href="/admin" className="auth-button">
      {t.adminLink}
    </Link>
  );
};

export default AdminLink;
