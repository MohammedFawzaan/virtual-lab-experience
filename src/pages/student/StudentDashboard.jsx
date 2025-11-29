import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserDataContext } from '../../context/UserContext';
import api from "@/api/client";
import { Button } from "@/components/ui/button";

export default function StudentDashboard() {
  const [experiments, setExperiments] = useState([]);
  const [statuses, setStatuses] = useState({});
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserDataContext);

  useEffect(() => {
    // Load experiments
    api.get("/api/experiments").then((res) => setExperiments(res.data));

    // Load user experiment statuses
    api.get("/api/titration").then((res) => {
      const map = {};
      res.data.forEach((run) => {
        map[run.experimentId?._id] = { isCompleted: run.isComplete, runId: run._id };
      });
      setStatuses(map);
    });
  }, []);

  const onLogout = async () => {
    try {
      await api.post("/api/logout", {}, { withCredentials: true });
      setUser({ authenticated: false });
      navigate('/home');
    } catch (error) {
      console.log("Logout error", error);
    }
  };

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-muted/20 via-muted/10 to-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gradient mb-2">
            Welcome, {user?.user?.firstname}!
          </h1>
          <p className="text-muted-foreground">Explore and perform the available experiments</p>
        </div>
        <Button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white">
          Sign Out
        </Button>
      </div>

      {/* Experiments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {experiments.map((exp) => {
          const status = statuses[exp._id];
          const completed = status?.isCompleted;

          return (
            <div
              key={exp._id}
              className="bg-white rounded-3xl shadow-lg border border-muted/20 p-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-300"
            >
              <div className="mb-4">
                <h2 className="capitalize text-2xl font-bold text-primary mb-2">{exp.title}</h2>
                <p className="text-sm text-muted-foreground mb-2">{exp.subtitle}</p>
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(exp.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                {completed ? (
                  <Button
                    onClick={() => navigate(`/dashboard/insights/${status.runId}`)}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white"
                  >
                    Data Insights
                  </Button>
                ) : (
                  <Link to={`/experiment/${exp._id}`}>
                    <Button className="bg-gradient-to-r from-primary to-secondary text-white">
                      Perform
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {experiments.length === 0 && (
        <div className="mt-20 text-center text-muted-foreground">
          No experiments available yet. Please check back later.
        </div>
      )}
    </div>
  );
}
