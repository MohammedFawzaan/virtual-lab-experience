import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

const formatObservationTime = (timeStr: string) => {
  const date = new Date(timeStr);
  return isNaN(date.getTime()) ? timeStr : date.toLocaleTimeString();
};

export default function AdminInsights() {
  const { experimentId } = useParams();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/experiments/${experimentId}/all`)
      .then((res) => setRuns(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [experimentId]);

  const handleDelete = async (runId: string, type: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this run? This action cannot be undone."
      )
    )
      return;

    try {
      let endpoint = "";
      if (type === "titration") endpoint = `/api/titration/${runId}`;
      else if (type === "distillation") endpoint = `/api/distillation/${runId}`;
      else if (type === "salt-analysis") endpoint = `/api/saltanalysis/${runId}`;
      else return;

      await api.delete(endpoint);
      setRuns(runs.filter((r: any) => r._id !== runId));
      toast.success("Exp deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete run");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin" />
      </div>
    );

  if (runs.length === 0)
    return (
      <div className="p-10 text-center text-lg text-muted-foreground">
        No student has performed this experiment yet. You can log in as a student
        and perform this experiment.
      </div>
    );

  return (
    <div className="p-6 sm:p-10 bg-muted/10 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl lg:text-3xl font-bold tracking-tight"
        >
          Insights – {runs[0]?.experimentId?.title}
        </motion.h1>

        <Link to="/admin/dashboard">
          <Button className="rounded-xl px-6 py-3 shadow-md hover:shadow-lg transition-all">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {runs.map((run: any, index: number) => (
          <motion.div
            key={run._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="rounded-2xl shadow-md border border-gray-200 bg-white hover:shadow-lg transition-all">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h2 className="font-semibold text-lg">
                    Performed by {run.userId.firstname} {run.userId.lastname}
                  </h2>

                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => handleDelete(run._id, run.experimentType)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">{run.userId.email}</p>

                <Separator />

                <p className="mt-2 font-medium">
                  Status: {" "}
                  <span
                    className={
                      run.isComplete ? "text-green-600" : "text-yellow-600"
                    }
                  >
                    {run.isComplete ? "Completed" : "In Progress"}
                  </span>
                </p>

                {run.isComplete && (
                  <div className="mt-2 text-sm space-y-1">
                    {run.experimentType === "titration" && (
                      <>
                        <p>Final Volume: {run.finalVolume}</p>
                        <p>Final pH: {run.finalPH}</p>
                        <p>Final Color: {run.finalColor}</p>
                      </>
                    )}

                    {run.experimentType === "distillation" && (
                      <>
                        <p>
                          Total Collected: {run.distillation?.totalCollected} mL
                        </p>
                        <p>
                          Initial Mixture: {" "}
                          {run.distillation?.initialMixture?.componentA} + {" "}
                          {run.distillation?.initialMixture?.componentB}
                        </p>
                      </>
                    )}

                    {run.experimentType === "salt-analysis" && (
                      <>
                        <p>
                          Detected Cation: {run.saltAnalysis?.detectedCation}
                        </p>
                        <p>
                          Detected Anion: {run.saltAnalysis?.detectedAnion}
                        </p>
                        <p>Final Result: {run.saltAnalysis?.finalResult}</p>
                      </>
                    )}

                    <p>Total Observations: {run.stats.totalObservations}</p>
                    <p>
                      Time Taken: {run.stats.timeTakenSeconds || run.stats.timeTaken}
                      s
                    </p>
                  </div>
                )}

                <div className="mt-3">
                  <h3 className="font-semibold mb-1">Observations:</h3>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {run.observations.map((obs: any, i: number) => (
                      <div
                        key={i}
                        className="text-xs border-b py-1 px-1 bg-white rounded"
                      >
                        <p className="font-medium text-primary">
                          {formatObservationTime(obs.time)}
                        </p>
                        <p>{obs.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}