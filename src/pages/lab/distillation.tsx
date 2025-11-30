import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, RotateCcw, BookOpen, CheckCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api/client";
import { useNavigate } from "react-router-dom";

type Props = {
  experimentId?: string;
  experimentTitle?: string;
};

const Distillation: React.FC<Props> = ({ experimentId: propExperimentId, experimentTitle: propExperimentTitle }) => {
  const params = useParams();
  const experimentId = propExperimentId || (params as any).id || "";
  const [runId, setRunId] = useState<string | null>(null);

  const navigate = useNavigate();

  const [temperature, setTemperature] = useState(20);
  const [vaporRate, setVaporRate] = useState(0);
  const [collectedVolume, setCollectedVolume] = useState(0);
  const [color, setColor] = useState("#87CEEB");
  const [isBoiling, setIsBoiling] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [observations, setObservations] = useState<Array<string>>([]);
  const [isSaving, setIsSaving] = useState(false);

  const hasFinalizedRef = useRef(false);
  const [experimentTitle, setExperimentTitle] = useState(propExperimentTitle || "Distillation");

  // Start a run
  useEffect(() => {
    let mounted = true;
    const start = async () => {
      try {
        const res = await api.post("/api/distillation", { experimentId });
        if (!mounted) return;
        setRunId(res.data._id);
        toast.success("Distillation started");
      } catch (error) {
        toast.error("Failed to start run");
      }
    };
    if (experimentId) start();
    return () => { mounted = false; };
  }, [experimentId]);

  // For adding messages locally
  const addObservationLocal = (msg: string) => {
    const entry = `${new Date().toLocaleTimeString()}: ${msg}`;
    setObservations(prev => [entry, ...prev]);
  };

  // Slider movement = update UI state
  const handleTemperatureChange = (newTemp: number[]) => {
    const t = newTemp[0];
    setTemperature(t);

    if (t < 60) {
      setIsBoiling(false);
      setVaporRate(0);
      setColor("#87CEEB");
    } else if (t >= 60 && t < 90) {
      setIsBoiling(false);
      setVaporRate((t - 60) * 0.3);
      setColor("#ADD8E6");
    } else if (t >= 90 && t < 100) {
      setIsBoiling(true);
      setVaporRate((t - 80) * 0.5);
      setColor("#B0E0E6");
    } else if (t >= 100) {
      setIsBoiling(true);
      setVaporRate(15 + (t - 100) * 0.2);
      setColor("#e0f7ff");
      setCollectedVolume((v) => v + 0.3);
      if (!isComplete && collectedVolume >= 25) {
        setIsComplete(true);
        addObservationLocal("Collected 25mL - Distillation complete!");
        toast.success("Distillation complete!");
      }
    }
  };

  // Save observation to backend
  const recordCurrentState = async () => {
    if (!runId) return toast.error("Run not initialized");
    setIsSaving(true);
    try {
      const payload = {
        message: `Temp: ${temperature}°C, Vapor: ${vaporRate.toFixed(2)}, Collected: ${collectedVolume.toFixed(1)}mL`,
        temperature,
        vaporRate,
        collectedVolume: Number(collectedVolume.toFixed(2)),
      };
      await api.post(`/api/distillation/${runId}/observations`, payload);
      addObservationLocal(payload.message);
      toast.success("Observation saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  // Finalize function
  const finalize = async () => {
    if (!runId) return toast.error("Run not initialized");
    if (hasFinalizedRef.current) return;

    hasFinalizedRef.current = true;
    setIsSaving(true);

    try {
      const payload = {
        finalTemperature: temperature,
        totalCollected: collectedVolume,
        isComplete: true,
      };

      await api.post(`/api/distillation/${runId}/finalize`, payload);
      toast.success("Experiment completed!");
      setIsComplete(true);

    } catch (error) {
      toast.error("Failed to finalize");
      hasFinalizedRef.current = false;
    } finally {
      setIsSaving(false);
    }
  };

  // Auto finalize on completion
  useEffect(() => {
    if (isComplete) {
      finalize();
      // navigate('/student/dashboard'); // Removed - show completion UI instead
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  // Reset
  const resetExperiment = async () => {
    try {
      // if (runId) await api.delete(`/api/distillation/${runId}`); // Removed - preserve data in DB
    } catch { }
    finally {
      setTemperature(20);
      setVaporRate(0);
      setCollectedVolume(0);
      setIsBoiling(false);
      setIsComplete(false);
      setObservations([]);
      setRunId(null);
      hasFinalizedRef.current = false;

      toast.info("Experiment reset");

      // restart run
      if (experimentId) {
        const res = await api.post("/api/distillation", { experimentId });
        setRunId(res.data._id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">

      {/* HEADER */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/student/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
          </Link>

          <h1 className="capitalize text-xl font-semibold">{experimentTitle}</h1>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetExperiment}>
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>

            {/* NEW MANUAL COMPLETE BUTTON */}
            <Button size="sm" onClick={finalize} disabled={isSaving || !runId || isComplete}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Experiment
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Panel */}
          <Card className="glass-effect p-6 space-y-6 lg:col-span-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Distillation Process</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2 text-primary">Objective</h3>
                <p className="text-sm text-muted-foreground">
                  Separate components of a mixture based on their boiling points by heating and condensing.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 text-primary">Procedure</h3>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Increase temperature using the slider</li>
                  <li>Observe boiling and vapor formation</li>
                  <li>Collect distillate in the receiving flask</li>
                  <li>Target: Collect 25mL of distillate</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 text-primary">Safety Notes</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Monitor temperature closely</li>
                  <li>• Ensure proper cooling water flow</li>
                  <li>• Do not let the flask boil dry</li>
                </ul>
              </div>
            </div>

            {isComplete && (
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✨</span>
                  <h3 className="font-semibold text-accent">Experiment Complete!</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  You've successfully completed the distillation. Data saved to your profile.
                </p>
              </div>
            )}
          </Card>

          {/* Center Panel (Equipment) */}
          <Card className="glass-effect p-8 lg:col-span-1 flex flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Distillation Setup</h2>
              <p className="text-sm text-muted-foreground">Control heat to separate components</p>
            </div>

            {/* Visual Representation */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div
                className="w-40 h-40 rounded-full border-8 border-primary/30 transition-colors duration-500"
                style={{ backgroundColor: color }}
              />
              {isBoiling && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20"></span>
                </div>
              )}
            </div>

            {/* Slider */}
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Temperature (°C)</span>
                <span className="text-2xl font-bold font-mono text-primary">{temperature}</span>
              </div>
              <Slider value={[temperature]} onValueChange={handleTemperatureChange} max={150} step={1} className="w-full" />
            </div>
          </Card>

          {/* Right Panel (Measurements & Observations) */}
          <Card className="glass-effect p-6 space-y-6 lg:col-span-1">
            <h2 className="text-xl font-semibold">Measurements</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Vapor Rate</div>
                <div className="text-3xl font-bold font-mono text-primary">{vaporRate.toFixed(2)}</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Collected Volume</div>
                <div className="text-3xl font-bold font-mono text-secondary">{collectedVolume.toFixed(1)} mL</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <div className="text-lg font-semibold">
                  {!isBoiling && "Heating..."}
                  {isBoiling && <span className="text-accent">Boiling & Distilling ⚗️</span>}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Observations</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {observations.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No observations yet. Start heating!</p>
                ) : (
                  observations.map((obs, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/30 text-sm">{obs}</div>
                  ))
                )}
              </div>

              <div className="mt-4 space-y-2">
                <Button variant="outline" size="sm" className="w-full" onClick={recordCurrentState} disabled={isSaving || !runId}>
                  Record Current State
                </Button>

                <Button size="sm" className="w-full" onClick={() => {
                  // quick local note + backend save
                  addObservationLocal(`Quick note at ${temperature}°C`);
                  recordCurrentState();
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