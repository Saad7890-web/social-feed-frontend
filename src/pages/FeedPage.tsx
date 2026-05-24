import { useAuth } from "../context/AuthContext";

export default function FeedPage() {
  const { user } = useAuth();

  return (
    <main style={{ minHeight: "100vh", padding: 24 }}>
      <h1>Feed</h1>
      <p>Welcome, {user?.firstName ?? "User"}.</p>
      <p>Step 3 will replace this with the real feed UI and data flow.</p>
    </main>
  );
}
