import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formatObservationTime = (timeStr: string) => {
  const date = new Date(timeStr);
  return isNaN(date.getTime()) ? timeStr : date.toLocaleTimeString();
};

export default function DataInsights() {
  const { type, runId } = useParams();
  const [run, setRun] = useState<any>(null);

  useEffect(() => {
    if (runId && type) {
      const apiType = type === "salt-analysis" ? "saltanalysis" : type;

      api
        .get(`/api/${apiType}/${runId}`)
        .then((res) => setRun(res.data))
        .catch((err) => console.error(err));
    }
  }, [runId, type]);

  if (!run)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen p-6 sm:p-10 bg-muted/10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl lg:text-3xl font-bold tracking-tight"
        >
          {run?.experimentTitle} — <span className="text-primary">Performed by You</span>
        </motion.h1>

        <Link to="/student/dashboard">
          <Button className="rounded-xl px-6 py-3 shadow-md hover:shadow-lg transition-all">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="shadow-lg rounded-2xl border border-gray-200 bg-white mb-8">
          <CardContent className="p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Final Measurements</h2>

            {type === "titration" && (
              <div className="space-y-1">
                <p>Final Volume: {run?.finalVolume} mL</p>
                <p>Final pH: {run?.finalPH}</p>
                <p>Final Color: {run?.finalColor}</p>
                <p>Endpoint Volume: {run?.stats?.endpointVolume}</p>
                <p>pH Change Rate: {run?.stats?.phChangeRate?.toFixed(2)}</p>
              </div>
            )}

            {type === "distillation" && (
              <div className="space-y-1">
                <p>Total Collected: {run.distillation?.totalCollected} mL</p>
                <p>
                  Initial Mixture: {run.distillation?.initialMixture?.componentA} +
                  {" "}
                  {run.distillation?.initialMixture?.componentB}
                </p>
              </div>
            )}

            {type === "salt-analysis" && (
              <div className="space-y-1">
                <p>Detected Cation: {run.saltAnalysis?.detectedCation}</p>
                <p>Detected Anion: {run.saltAnalysis?.detectedAnion}</p>
                <p>Final Result: {run.saltAnalysis?.finalResult}</p>
                <p>Total Tests: {run.stats?.totalTests}</p>
              </div>
            )}

            <Separator className="my-4" />

            <div className="space-y-1">
              <p>Time Taken: {run.stats?.timeTaken || run.stats?.timeTakenSeconds} seconds</p>
              <p>Total Observations: {run.stats?.totalObservations}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-lg rounded-2xl border border-gray-200 bg-white">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-4">Observations</h2>

            <div className="space-y-3">
              {run.observations.length === 0 ? (
                <p className="text-gray-500">No observations recorded.</p>
              ) : (
                run.observations.map((obs: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 rounded-lg bg-white border shadow-sm hover:shadow-md transition-all"
                  >
                    <p>
                      <strong className="text-primary">
                        {formatObservationTime(obs.time)}
                      </strong>{" "}
                      : {obs.message}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}