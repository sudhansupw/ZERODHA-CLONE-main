import Dashboard from "./Dashboard";
import TopBar from "./TopBar";
import UserProvider from "../context/userContext"; // ✅ import your provider

function Home() {
  return (
    <UserProvider>
      {" "}
      {/* 👈 Wrap the entire dashboard section */}
      <div className="dashboard-root">
        <TopBar />
        <Dashboard />
      </div>
    </UserProvider>
  );
}

export default Home;
