import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserDataContext } from '../../context/UserContext.tsx';
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function StudentDashboard() {
  const [experiments, setExperiments] = useState([]);
  const [statuses, setStatuses] = useState({});
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserDataContext);

  useEffect(() => {
    // Load experiments
    api.get("/api/experiments").then((res) => setExperiments(res.data));

    // Load user experiment statuses
    const fetchStatuses = async () => {
      try {
        const [titrationRes, distillationRes, saltAnalysisRes] = await Promise.all([
          api.get("/api/titration"),
          api.get("/api/distillation"),
          api.get("/api/saltanalysis")
        ]);

        const map = {};

        titrationRes.data.forEach((run) => {
          if (run.experimentId) {
            map[run.experimentId._id] = {
              isCompleted: run.isComplete,
              runId: run._id,
              type: 'titration'
            };
          }
        });

        distillationRes.data.forEach((run) => {
          if (run.experimentId) {
            map[run.experimentId._id] = {
              isCompleted: run.isComplete,
              runId: run._id,
              type: 'distillation'
            };
          }
        });

        saltAnalysisRes.data.forEach((run) => {
          if (run.experimentId) {
            map[run.experimentId._id] = {
              isCompleted: run.isComplete,
              runId: run._id,
              type: 'salt-analysis'
            };
          }
        });

        setStatuses(map);
      } catch (error) {
        console.error("Failed to load statuses", error);
      }
    };
    fetchStatuses();
  }, []);

  const onLogout = async () => {
    try {
      await api.post("/api/logout", {}, { withCredentials: true });
      setUser({ authenticated: false });
      navigate('/home');
      toast({
        title: 'Logged Out',
        duration: 1000,
        variant: 'destructive'
      });
    } catch (error) {
      console.log("Logout error", error);
    }
  };

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-muted/20 via-muted/10 to-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gradient mb-2">
            Welcome, {user?.user?.firstname + " " + user?.user?.lastname}!
          </h1>
          <p className="text-muted-foreground">Explore and perform the available experiments</p>
        </div>
        <Button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white">
          Sign Out
        </Button>
      </div>

      {/* Demo Videos Section */}
      <div className="mb-8 bg-white rounded-3xl shadow-lg border border-muted/20 p-6">
        <h2 className="text-2xl font-bold mb-4">📹 Experiment Demo Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => window.open('https://www.youtube.com/watch?v=2h01ovEzBTw&list=PL6f7Lu8oDTmamwKoOR0Km-yzD_aphrNRx&index=2', '_blank')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
          >
            🧪 Titration Demo
          </Button>
          <Button
            onClick={() => window.open('https://www.youtube.com/watch?v=xRGR5ZvO3AU&list=PL6f7Lu8oDTmamwKoOR0Km-yzD_aphrNRx&index=3', '_blank')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
          >
            ⚗️ Distillation Demo
          </Button>
          <Button
            onClick={() => window.open('https://www.youtube.com/watch?v=9VbQO6bv6HQ&list=PL6f7Lu8oDTmamwKoOR0Km-yzD_aphrNRx&index=1', '_blank')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white"
          >
            🧂 Salt Analysis Demo
          </Button>
        </div>
      </div>

      {/* Experiments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {experiments.map((exp) => {
          const status = statuses[exp._id];
          const completed = status?.isCompleted;

          return (
            <div
              key={exp._id}
              className="bg-white rounded-3xl shadow-lg border border-muted/20 p-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-300">
              <div className="mb-4">
                <h2 className="capitalize text-2xl font-bold text-primary mb-2">{exp.title}</h2>
                <p className="text-sm text-muted-foreground mb-2">Experiment type: {exp?.type}</p>
                <p className="text-sm text-muted-foreground mb-2">{exp?.description}</p>
                <p className="text-sm text-muted-foreground mb-2">Created by admin: {exp.createdBy.firstname + " " + exp.createdBy.lastname}</p>
                <div className="text-xs text-muted-foreground">
                  Created at: {new Date(exp.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                {completed ? (
                  <Button
                    onClick={() => navigate(`/dashboard/insights/${status.type}/${status.runId}`)}
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
