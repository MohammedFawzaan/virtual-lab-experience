import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { UserDataContext } from "../context/UserContext.tsx";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.tsx";

const RoleSelection = () => {
  const { user, setUser } = useContext(UserDataContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.user?.role) {
      navigate("/home");
    }
  }, [user]);

  const selectRole = async (role) => {
    if (!user) return;

    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/set-role`,
        { role },
        { withCredentials: true }
      );

      setUser({ ...user, user: res.data.user });

      navigate("/home");
    } catch (err) {
      console.log("Error setting role", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-muted/10 via-muted/20 to-muted/5 px-4">
      <h2 className="text-4xl sm:text-5xl font-extrabold mb-5 text-center text-primary">
        Select Your Role
      </h2>
      <div className="text-center max-w-3xl text-sm sm:text-base text-muted-foreground">
        <p>
          <span className="font-semibold text-primary">Admin (Faculty):</span> Create experiments and view student's data insights.
        </p>
        <p>
          <span className="font-semibold text-primary">Student:</span> Can perform experiments created by faculty and view their own data insights.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 w-full max-w-4xl justify-center items-center">
        <Button
          onClick={() => selectRole("student")}
          disabled={loading}
          className="h-44 sm:h-52 w-44 sm:w-52 text-2xl sm:text-3xl rounded-3xl shadow-lg flex flex-col items-center justify-center
                 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white
                 hover:scale-105 active:scale-95 transition-transform duration-300">
          🎓 Student
        </Button>
        <Button
          onClick={() => selectRole("admin")}
          disabled={loading}
          variant="secondary"
          className="h-44 sm:h-52 w-44 sm:w-52 text-2xl sm:text-3xl rounded-3xl shadow-lg flex flex-col items-center justify-center
                 bg-gradient-to-tr from-green-400 via-teal-400 to-cyan-400 text-white
                 hover:scale-105 active:scale-95 transition-transform duration-300">
          🛠️ Admin
        </Button>
      </div>
    </div>
  );
};

export default RoleSelection;