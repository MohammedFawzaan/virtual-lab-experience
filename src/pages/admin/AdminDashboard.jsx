import { useEffect, useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import api from "@/api/client";
import axios from "axios";
import { UserDataContext } from '../../context/UserContext';
import { Trash2, PlusCircle } from "lucide-react";

export default function AdminDashboard() {
  const [experiments, setExperiments] = useState([]);
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserDataContext);

  useEffect(() => {
    api.get("/api/experiments").then((res) => setExperiments(res.data));
  }, []);

  const onLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/logout`, {}, { withCredentials: true });
      setUser({ authenticated: false });
      navigate('/home');
    } catch (error) {
      console.log("Logout error", error);
    }
  };

  const deleteExperiment = async (id) => {
    try {
      await api.delete(`/api/experiments/${id}`);
      setExperiments(experiments.filter(exp => exp._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-muted/20 via-muted/10 to-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gradient mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage and create experiments for students</p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <Link to="/admin/create-experiment">
            <Button className="bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5" /> Create Experiment
            </Button>
          </Link>
          <Button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white">
            Sign Out
          </Button>
        </div>
      </div>

      {/* Experiments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {experiments.map((exp) => (
          <div
            key={exp._id}
            className="bg-white rounded-3xl shadow-lg border border-muted/20 p-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-300"
          >
            {/* Experiment Info */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-primary mb-2">{exp.title}</h2>
              <p className="text-sm text-muted-foreground mb-2">{exp.subtitle}</p>
              <div className="flex gap-2 flex-wrap text-xs text-muted-foreground">
                <span>Created: {new Date(exp.createdAt).toLocaleDateString()}</span>
                <span>Last Updated: {new Date(exp.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => navigate(`/admin/insights/${exp._id}`)}
              >
                View Insights
              </Button>
              <Button
                variant="destructive"
                className="flex items-center gap-1"
                onClick={() => deleteExperiment(exp._id)}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {experiments.length === 0 && (
        <div className="mt-20 text-center text-muted-foreground">
          No experiments created yet. Click "Create Experiment" to add one.
        </div>
      )}
    </div>
  );
}