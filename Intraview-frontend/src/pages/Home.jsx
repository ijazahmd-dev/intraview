import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user, logoutUser } = useAuth();

  return (
    <div>
      <h2>Welcome, {user.username} 👋</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>

      <button onClick={logoutUser}>Logout</button>
    </div>
  );
};

export default Home;
