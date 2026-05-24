import { useNavigate } from "react-router-dom";
import { FeedLayout } from "../components/feed/FeedLayout";
import { useAuth } from "../context/AuthContext";

export default function FeedPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return <FeedLayout user={user} onSignOut={handleSignOut} />;
}
