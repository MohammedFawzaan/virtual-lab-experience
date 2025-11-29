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

const Titration: React.FC<Props> = ({ experimentId: propExperimentId, experimentTitle: propExperimentTitle }) => {
  const params = useParams();
  const experimentId = propExperimentId || (params as any).id || "";
  const [runId, setRunId] = useState<string | null>(null);

  const navigate = useNavigate();

  const [volume, setVolume] = useState(0);
  const [pH, setPH] = useState(1.2);
  const [color, setColor] = useState("#ff6b6b");
  const [isComplete, setIsComplete] = useState(false);
  const [observations, setObservations] = useState<Array<string>>([]);
  const [isSaving, setIsSaving] = useState(false);

  const hasFinalizedRef = useRef(false);
  const [experimentTitle, setExperimentTitle] = useState(propExperimentTitle || "Titration");

  // Start a run
  useEffect(() => {
    let mounted = true;
    const start = async () => {
      try {
        const res = await api.post("/api/titration", { experimentId });
        if (!mounted) return;
        setRunId(res.data._id);
        toast.success("Titration started");
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
  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);

    if (vol < 20) {
      setPH(1.2 + vol * 0.15);
      setColor("#ff6b6b");
    } else if (vol < 25) {
      setPH(5 + (vol - 20) * 0.4);
      setColor("#ff8b8b");
    } else if (vol < 30) {
      setPH(7 + (vol - 25) * 0.2);
      setColor("#ffd6e8");
      if (!isComplete && vol >= 24.5 && vol <= 25.5) {
        setIsComplete(true);
        addObservationLocal(`Endpoint reached at ${vol.toFixed(1)} mL - Color changed to pink!`);
        toast.success("Endpoint detected!");
      }
    } else {
      setPH(8 + (vol - 30) * 0.1);
      setColor("#ffa4d6");
    }
  };

  // Save observation to backend
  const recordCurrentState = async () => {
    if (!runId) return toast.error("Run not initialized");
    setIsSaving(true);
    try {
      const payload = {
        message: `Volume: ${volume.toFixed(1)} mL, pH: ${pH.toFixed(2)}, Color: ${color}`,
        volume: Number(volume.toFixed(2)),
        pH: Number(pH.toFixed(2)),
        color,
      };
      await api.post(`/api/titration/${runId}/observations`, payload);
      addObservationLocal(payload.message);
      toast.success("Observation saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  // FIXED FINALIZE FUNCTION
  const finalize = async () => {
    if (!runId) return toast.error("Run not initialized");
    if (hasFinalizedRef.current) return;

    hasFinalizedRef.current = true;
    setIsSaving(true);

    try {
      const payload = {
        finalVolume: Number(volume.toFixed(2)),
        finalPH: Number(pH.toFixed(2)),
        finalColor: color,
        isComplete: true,
        stats: {
          endpointVolume: Number(volume.toFixed(2)),
          phChangeRate: Number((pH / volume).toFixed(3)) || null,
          timeTakenSeconds: Math.floor((Date.now() - performance.timeOrigin) / 1000),
        }
      };

      await api.post(`/api/titration/${runId}/finalize`, payload);
      toast.success("Experiment completed!");
      setIsComplete(true);

    } catch (error) {
      toast.error("Failed to finalize");
      hasFinalizedRef.current = false;
    } finally {
      setIsSaving(false);
    }
  };

  // Auto finalize on endpoint
  useEffect(() => {
    if (isComplete) {
      finalize();
      navigate('/student/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  // Reset
  const resetExperiment = async () => {
    try {
      if (runId) await api.delete(`/api/titration/${runId}`);
    } catch { }
    finally {
      setVolume(0);
      setPH(1.2);
      setColor("#ff6b6b");
      setIsComplete(false);
      setObservations([]);
      setRunId(null);
      hasFinalizedRef.current = false;

      toast.info("Experiment reset");

      // restart run
      if (experimentId) {
        const res = await api.post("/api/titration", { experimentId });
        setRunId(res.data._id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">

      {/* HEADER */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/lab">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lab
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
              <h2 className="text-xl font-semibold">Acid-Base Titration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2 text-primary">Objective</h3>
                <p className="text-sm text-muted-foreground">
                  Determine the concentration of an unknown acid by titrating with a standard base solution.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 text-primary">Procedure</h3>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Add the base solution slowly using the slider</li>
                  <li>Observe the color change in the solution</li>
                  <li>Record the volume when the endpoint is reached</li>
                  <li>The endpoint occurs around 24-26 mL (pink color)</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 text-primary">Safety Notes</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Watch for the sudden color change</li>
                  <li>• Add solution slowly near endpoint</li>
                  <li>• Record observations carefully</li>
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
                  You've successfully identified the endpoint. Data saved to your profile.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => { /* navigate to next experiment or show results */ }}>
                    Next: Distillation
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Center Panel (Equipment) */}
          <Card className="glass-effect p-8 lg:col-span-1 flex flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Titration Setup</h2>
              <p className="text-sm text-muted-foreground">Use the controls below to perform the experiment</p>
            </div>

            {/* Burette */}
            <div className="relative w-32 h-80 bg-gradient-to-b from-muted/30 to-muted/10 rounded-3xl border-4 border-primary/30 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none">
                {[0, 10, 20, 30, 40, 50].map((mark) => (
                  <div key={mark} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="w-2 h-px bg-primary/40" />
                    <span className="font-mono">{mark}</span>
                  </div>
                ))}
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out"
                style={{
                  height: `${(volume / 50) * 100}%`,
                  background: `linear-gradient(to bottom, ${color}dd, ${color})`
                }}
              />
            </div>

            {/* Beaker */}
            <div className="relative">
              <div className="w-48 h-48 rounded-full border-8 border-primary/20 overflow-hidden shadow-2xl bg-gradient-to-b from-transparent to-muted/20">
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out"
                  style={{
                    height: '80%',
                    background: `linear-gradient(to bottom, ${color}dd, ${color})`,
                    boxShadow: '0 0 40px rgba(255, 107, 107, 0.3)'
                  }}
                />
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">Solution Color</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-8 h-8 rounded-full border-2 border-primary/30" style={{ backgroundColor: color }} />
                  <span className="font-mono text-sm">{color}</span>
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Volume Added (mL)</span>
                <span className="text-2xl font-bold font-mono text-primary">{volume.toFixed(1)}</span>
              </div>
              <Slider value={[volume]} onValueChange={handleVolumeChange} max={50} step={0.1} className="w-full" />
            </div>
          </Card>

          {/* Right Panel (Measurements & Observations) */}
          <Card className="glass-effect p-6 space-y-6 lg:col-span-1">
            <h2 className="text-xl font-semibold">Measurements</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Current pH</div>
                <div className="text-3xl font-bold font-mono text-primary">{pH.toFixed(2)}</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Volume Added</div>
                <div className="text-3xl font-bold font-mono text-secondary">{volume.toFixed(1)} mL</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <div className="text-lg font-semibold">
                  {volume === 0 && "Ready to begin"}
                  {volume > 0 && volume < 20 && "Adding base..."}
                  {volume >= 20 && volume < 24 && "Approaching endpoint"}
                  {volume >= 24 && volume <= 26 && <span className="text-accent">At endpoint! 🎯</span>}
                  {volume > 26 && "Past endpoint"}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Observations</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {observations.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No observations yet. Start adding the base solution!</p>
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
                  addObservationLocal(`Quick note at ${volume.toFixed(1)} mL, pH ${pH.toFixed(2)}`);
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

export default Titration;
