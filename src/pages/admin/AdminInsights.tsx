import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/client";
import { Card } from "@/components/ui/card";

export default function AdminInsights() {
  const { experimentId } = useParams();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/experiments/${experimentId}/all`)
      .then((res) => setRuns(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [experimentId]);

  if (loading) return <div className="p-10">Loading...</div>;
  if (runs.length === 0) return <div className="p-10">No users performed this experiment yet.</div>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-8">
        Insights – {runs[0]?.experimentId?.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {runs.map((run) => (
          <Card key={run._id} className="p-4">
            <h2 className="font-bold text-lg">
              {run.userId.firstname} {run.userId.lastname}
            </h2>
            <p className="text-sm text-muted-foreground">{run.userId.email}</p>

            <p className="mt-2">
              Status: {run.isComplete ? "Completed" : "In Progress"}
            </p>

            {run.isComplete && (
              <div className="mt-2 text-sm">
                <p>Final Volume: {run.finalVolume}</p>
                <p>Final pH: {run.finalPH}</p>
                <p>Final Color: {run.finalColor}</p>
                <p>Total Observations: {run.stats.totalObservations}</p>
                <p>Time Taken: {run.stats.timeTakenSeconds}s</p>
              </div>
            )}

            <div className="mt-3">
              <h3 className="font-semibold">Observations:</h3>
              {run.observations.map((obs, i) => (
                <div key={i} className="text-xs border-b py-1">
                  <p>{new Date(obs.time).toLocaleTimeString()}</p>
                  <p>{obs.message}</p>
                  {obs.volume && <p>Volume: {obs.volume}</p>}
                  {obs.pH && <p>pH: {obs.pH}</p>}
                  {obs.color && <p>Color: {obs.color}</p>}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
