import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/api/client";
import { Button } from "@/components/ui/button";

const formatObservationTime = (timeStr: string) => {
  const date = new Date(timeStr);
  return isNaN(date.getTime()) ? timeStr : date.toLocaleTimeString();
};

export default function DataInsights() {
  const { type, runId } = useParams();
  const [run, setRun] = useState<any>(null);

  useEffect(() => {
    if (runId && type) {
      // Convert type to API endpoint format (salt-analysis -> saltanalysis)
      const apiType = type === 'salt-analysis' ? 'saltanalysis' : type;

      api.get(`/api/${apiType}/${runId}`)
        .then(res => setRun(res.data))
        .catch(err => console.error(err));
    }
  }, [runId, type]);

  if (!run)
    return <div className="flex items-center justify-center h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin" />
    </div>;

  return (
    <div className="min-h-screen p-10 bg-muted/10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl lg:text-3xl sm:text-xl font-bold">{run?.experimentTitle} — Performed by You</h1>
        <Link to="/student/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Final Measurements</h2>

        {/* TITRATION SPECIFIC FIELDS */}
        {type === 'titration' && (
          <>
            <p>Final Volume: {run?.finalVolume} mL</p>
            <p>Final pH: {run?.finalPH}</p>
            <p>Final Color: {run?.finalColor}</p>
            <p>Endpoint Volume: {run?.stats?.endpointVolume}</p>
            <p>pH Change Rate: {run?.stats?.phChangeRate?.toFixed(2)}</p>
          </>
        )}

        {/* DISTILLATION SPECIFIC FIELDS */}
        {type === 'distillation' && (
          <>
            <p>Total Collected: {run.distillation?.totalCollected} mL</p>
            <p>Initial Mixture: {run.distillation?.initialMixture?.componentA} + {run.distillation?.initialMixture?.componentB}</p>
          </>
        )}

        {/* SALT ANALYSIS SPECIFIC FIELDS */}
        {type === 'salt-analysis' && (
          <>
            <p>Detected Cation: {run.saltAnalysis?.detectedCation}</p>
            <p>Detected Anion: {run.saltAnalysis?.detectedAnion}</p>
            <p>Final Result: {run.saltAnalysis?.finalResult}</p>
            <p>Total Tests: {run.stats?.totalTests}</p>
          </>
        )}

        {/* COMMON STATS */}
        <p>Time Taken: {run.stats?.timeTaken || run.stats?.timeTakenSeconds} seconds</p>
        <p>Total Observations: {run.stats?.totalObservations}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Observations</h2>
        <div className="space-y-2">
          {run.observations.length === 0 ? (
            <p>No observations recorded.</p>
          ) : (
            run.observations.map((obs: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-white shadow-sm">
                <p><strong>{formatObservationTime(obs.time)}</strong>: {obs.message}</p>
                {/* Distillation observations don't have pH/Color usually stored in the same flat way in the obs array 
                    unless we put them there. In our controller addObservation, we put 'message' in obs. 
                    If we want detailed fields, we'd need to check how we saved them.
                    In distillation.controller.js: 
                    obs = { message, time } -> so only message is available in the main observations array.
                    The detailed data went into distillation.temperatureProfile.
                */}
              </div>
            ))
          )}
        </div>
      </div>
    </div >
  );
}