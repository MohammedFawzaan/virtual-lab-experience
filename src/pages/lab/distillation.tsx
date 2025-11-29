import { useEffect, useState, useRef, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, RotateCcw, Droplet, Thermometer } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { UserDataContext } from "@/context/UserContext";

const Distillation = () => {
  const { id } = useParams();
  const { user } = useContext(UserDataContext);

  const [runId, setRunId] = useState<string | null>(null);

  // Simulation states
  const [temperature, setTemperature] = useState(25);
  const [vapour, setVapour] = useState<"none" | "A" | "B">("none");
  const [collected, setCollected] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [observations, setObservations] = useState<string[]>([]);
  const collectingRef = useRef<NodeJS.Timeout | null>(null);

  // Constants
  const MAX_COLLECTION = 50;
  const RATE_A = 0.12;
  const RATE_B = 0.08;

  // -------------------------
  // BACKEND: CREATE RUN ON LOAD
  // -------------------------
  useEffect(() => {
    const startRun = async () => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/experiment-runs/start`,
          {
            experimentId: id,
          },
          { withCredentials: true }
        );

        setRunId(res.data._id);
      } catch (err) {
        console.log(err);
        toast.error("Could not start experiment.");
      }
    };

    startRun();
  }, []);

  // -------------------------
  // DETERMINE VAPOUR
  // -------------------------
  useEffect(() => {
    if (temperature >= 70 && temperature < 90) setVapour("A");
    else if (temperature >= 95) setVapour("B");
    else setVapour("none");
  }, [temperature]);

  // -------------------------
  // COLLECTION LOGIC
  // -------------------------
  useEffect(() => {
    if (vapour === "none") {
      if (collectingRef.current) {
        clearInterval(collectingRef.current);
        collectingRef.current = null;
      }
      return;
    }

    if (collectingRef.current) clearInterval(collectingRef.current);

    collectingRef.current = setInterval(() => {
      setCollected((prev) => {
        const rate = vapour === "A" ? RATE_A : RATE_B;
        const next = Math.min(prev + rate, MAX_COLLECTION);

        // auto observation
        if (Math.floor(prev) !== Math.floor(next) && Math.floor(next) % 5 === 0) {
          addObservation(`Collected ${next.toFixed(1)} mL of ${vapour === "A" ? "Light fraction" : "Heavy fraction"}.`);
        }

        if (next >= MAX_COLLECTION && !isComplete) {
          setIsComplete(true);
          completeRun();
          addObservation("Distillation complete — Target volume reached.");
        }

        return next;
      });
    }, 1000);

    return () => {
      if (collectingRef.current) {
        clearInterval(collectingRef.current);
        collectingRef.current = null;
      }
    };
  }, [vapour]);

  // --------------------------
  // BACKEND: ADD OBSERVATION
  // --------------------------
  const addObservation = async (text: string) => {
    setObservations((prev) => [...prev, text]);

    if (!runId) return;

    await axios.patch(
      `${import.meta.env.VITE_BASE_URL}/api/experiment-runs/${runId}/observe`,
      {
        message: text,
      },
      { withCredentials: true }
    );
  };

  // --------------------------
  // BACKEND: COMPLETE RUN
  // --------------------------
  const completeRun = async () => {
    if (!runId) return;

    try {
      await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/experiment-runs/${runId}/complete`,
        {
          finalData: {
            collectedVolume: collected,
            status: "complete",
          }
        },
        { withCredentials: true }
      );

      toast.success("Distillation complete!");
    } catch (err) {
      console.log(err);
      toast.error("Failed to save completion.");
    }
  };

  // --------------------------
  // RESET (local only)
  // --------------------------
  const resetExperiment = () => {
    setTemperature(25);
    setVapour("none");
    setCollected(0);
    setIsComplete(false);
    setObservations([]);

    toast.info("Experiment reset.");
  };

  const vapourLabel =
    vapour === "A"
      ? "Light fraction vapor"
      : vapour === "B"
        ? "Heavy fraction vapor"
        : "No vapor";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/lab">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Distillation — Virtual Lab</h1>
          <Button variant="outline" onClick={resetExperiment}>
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
        </div>
      </header>

      {/* MAIN UI (your original UI unchanged except backend bindings) */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Panel - Instructions */}
          <Card className="glass-effect p-6 space-y-6 lg:col-span-1">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Simple Distillation</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2 text-primary">Objective</h3>
                <p className="text-sm text-muted-foreground">
                  Separate two components based on boiling points and collect the distillate.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 text-primary">Procedure</h3>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Increase the temperature using the slider.</li>
                  <li>Watch vapor formation and condensation into the receiver.</li>
                  <li>Record collected volume and observations.</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 text-primary">Safety Notes</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Increase temperature gradually near boiling ranges</li>
                  <li>• Note which fraction is coming over (light vs heavy)</li>
                  <li>• Stop heating if system overheats</li>
                </ul>
              </div>
            </div>

            {isComplete && (
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✨</span>
                  <h3 className="font-semibold text-accent">Collection Complete!</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  The distillate target was reached. You can reset or review observations.
                </p>
              </div>
            )}
          </Card>

          {/* Center Panel - Equipment */}
          <Card className="glass-effect p-8 lg:col-span-1 flex flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Distillation Setup</h2>
              <p className="text-sm text-muted-foreground">Heat, vaporize, condense — collect the distillate</p>
            </div>

            {/* Apparatus visualization */}
            <div className="relative w-64 h-64 rounded-2xl border-4 border-primary/20 overflow-hidden shadow-2xl flex items-center justify-center">
              {/* Flask (mixture) */}
              <div className="absolute left-6 bottom-8 w-28 h-28 rounded-full border-8 border-primary/20 overflow-hidden bg-gradient-to-b from-transparent to-muted/10">
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-700"
                  style={{
                    height: "60%",
                    background: vapour === "A" ? "linear-gradient(to bottom, #fef3d8, #ffd7a8)" : vapour === "B" ? "linear-gradient(to bottom, #d6f0ff, #a8d8ff)" : "transparent",
                    boxShadow: vapour === "none" ? "none" : "0 0 30px rgba(255,200,150,0.2)",
                  }}
                />
              </div>

              {/* Condenser + receiving */}
              <div className="absolute right-8 top-12 w-36 h-36 flex flex-col items-center">
                <div className="w-10 h-10 rounded-md border-2 border-border/40 mb-2 flex items-center justify-center">
                  <Droplet className="w-5 h-5 text-secondary" />
                </div>
                <div className="w-20 h-20 rounded-lg border-4 border-secondary/20 overflow-hidden bg-gradient-to-b from-transparent to-muted/20">
                  <div
                    className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                    style={{
                      height: `${(collected / MAX_COLLECTION) * 100}%`,
                      background: vapour === "A" ? "linear-gradient(to bottom, #ffd7a8aa, #ffd7a8)" : "linear-gradient(to bottom, #a8d8ffaa, #a8d8ff)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Temperature Control */}
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Temperature (°C)</span>
                <span className="text-2xl font-bold font-mono text-primary">{temperature}°C</span>
              </div>
              <Slider
                value={[temperature]}
                onValueChange={(v) => setTemperature(v[0])}
                min={25}
                max={120}
                step={1}
                className="w-full"
              />

              <div className="text-sm text-muted-foreground text-center">
                <div>{vapourLabel}</div>
                <div className="mt-1">Collected: <span className="font-mono font-bold">{collected.toFixed(1)} mL</span></div>
              </div>
            </div>
          </Card>

          {/* Right Panel - Data & Observations */}
          <Card className="glass-effect p-6 space-y-6 lg:col-span-1">
            <h2 className="text-xl font-semibold">Measurements</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Active Vapor</div>
                <div className="text-3xl font-bold font-mono text-primary">{vapour === "none" ? "None" : vapour}</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Collected Volume</div>
                <div className="text-3xl font-bold font-mono text-secondary">{collected.toFixed(1)} mL</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <div className="text-lg font-semibold">
                  {vapour === "none" && "No vapor — heat the flask"}
                  {vapour === "A" && "Light fraction distilling..."}
                  {vapour === "B" && "Heavy fraction distilling..."}
                  {isComplete && <span className="text-accent">Collection target reached 🎯</span>}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Observations</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {observations.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No observations yet. Start heating to see vapour.</p>
                ) : (
                  observations.map((obs, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/30 text-sm">{obs}</div>
                  ))
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => addObservation(`Temp: ${temperature}°C — ${vapourLabel} — Collected ${collected.toFixed(1)} mL`)}
                >
                  Record Current State
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    if (vapour !== "none") {
                      addObservation(`${vapour === "A" ? "Light" : "Heavy"} fraction vapor observed at ${temperature}°C`);
                      toast.success("Observation Recorded");
                    } else {
                      toast.error("No vapor present to observe");
                    }
                  }}>
                  Quick Note
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Distillation;
