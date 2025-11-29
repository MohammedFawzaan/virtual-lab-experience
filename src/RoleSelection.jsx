import { useState, useContext } from "react";
import axios from "axios";
import { UserDataContext } from "./context/UserContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";


const RoleSelection = () => {
  const { user, setUser } = useContext(UserDataContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const selectRole = async (role) => {
    if (!user) return;
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/set-role`,
        { userId: user.user._id, role },
        { withCredentials: true }
      );

      // Update user in context
      setUser({ ...user, user: res.data.user });
      navigate("/home"); // redirect after selection
    } catch (err) {
      console.log("Error setting role", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-muted/10">
      <h2 className="text-3xl font-bold mb-10">Select Your Role</h2>

      <div className="flex gap-20">
        <Button
          onClick={() => selectRole("student")}
          disabled={loading}
          className="h-40 w-40 text-xl rounded-2xl shadow-md flex flex-col items-center justify-center
                 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          🎓 Student
        </Button>

        <Button
          onClick={() => selectRole("admin")}
          disabled={loading}
          variant="secondary"
          className="h-40 w-40 text-xl rounded-2xl shadow-md flex flex-col items-center justify-center
                 transition-all duration-300 hover:scale-105 active:scale-95">
          🛠️ Admin
        </Button>
      </div>
    </div>

  );
};

export default RoleSelection;