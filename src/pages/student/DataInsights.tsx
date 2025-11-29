import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/api/client";
import { Button } from "@/components/ui/button";

export default function DataInsights() {
  const { runId } = useParams();
  const [run, setRun] = useState<any>(null);

  useEffect(() => {
    if (runId) {
      api.get(`/api/titration/${runId}`)
        .then(res => setRun(res.data))
        .catch(err => console.error(err));
    }
  }, [runId]);

  if (!run) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen p-10 bg-muted/10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{run.experimentTitle} — Data Insights</h1>
        <Link to="/student/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Final Measurements</h2>
        <p>Final Volume: {run.finalVolume} mL</p>
        <p>Final pH: {run.finalPH}</p>
        <p>Final Color: {run.finalColor}</p>
        <p>Time Taken: {run.stats?.timeTakenSeconds} seconds</p>
        <p>Endpoint Volume: {run.stats?.endpointVolume}</p>
        <p>pH Change Rate: {run.stats?.phChangeRate?.toFixed(2)}</p>
        <p>Total Observations: {run.stats?.totalObservations}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Observations</h2>
        <div className="space-y-2">
          {run.observations.length === 0 ? (
            <p>No observations recorded.</p>
          ) : (
            run.observations.map((obs, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-white shadow-sm">
                <p><strong>{new Date(obs.time).toLocaleTimeString()}</strong>: {obs.message}</p>
                <p>Volume: {obs.volume} mL, pH: {obs.pH}, Color: {obs.color}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
