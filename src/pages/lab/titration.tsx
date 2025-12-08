import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, RotateCcw, BookOpen, CheckCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api/client";
import { useNavigate } from "react-router-dom";

// --- STYLES CONSTANT ---
const STYLES = `
  @keyframes stir {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes drop {
    0% { transform: translateY(-5px) scale(0.5); opacity: 1; }
    100% { transform: translateY(20px) scale(1.5); opacity: 0; }
  }
  .animate-stir {
    animation: stir 1s linear infinite;
    transform-origin: center;
  }
  .animate-drop {
    animation: drop 0.4s ease-in forwards;
  }
  /* Glass effect for containers */
  .glass-effect {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(200, 200, 200, 0.5);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .burette-markings div {
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background-color: rgba(0,0,0,0.3);
  }
  .burette-markings span {
      position: absolute;
      right: -25px;
      font-size: 0.7rem;
      color: #333;
      background-color: #fff8;
      padding: 0 2px;
      border-radius: 2px;
  }
`;

// --- Titration Apparatus Visualization Component ---
const TitrationApparatus = ({ volume, color, isStirring, isDropping }: { volume: number, color: string, isStirring: boolean, isDropping: boolean }) => {
  const BURETTE_MAX_VOLUME = 50.0;
  // Calculate liquid level in burette (drops from 100% down to 0% of the maximum 50mL)
  const buretteLevelPercentage = Math.max(0, 100 - (volume / BURETTE_MAX_VOLUME) * 100);

  // Simple light color for the Titrant (Base)
  const titrantColor = "#fcd34d"; // Yellow/gold color for NaOH

  // Use the main color for the Analyte (Acid) in the flask
  const flaskBackgroundColor = color;

  return (
    <div className="relative w-full h-[500px] flex justify-center items-start pt-4">
      {/* 1. BURETTE STAND/CLAMP (Simplified) */}
      <div className="absolute top-0 w-1 h-full bg-gray-300 left-1/2 -translate-x-1/2 z-10"></div>
      <div className="absolute top-52 w-24 h-4 bg-gray-400 left-1/2 -translate-x-1/2 rounded-full z-20"></div>

      {/* 2. BURETTE */}
      <div className="absolute top-0 w-10 h-[380px] bg-gray-200/50 rounded-b-lg overflow-hidden border-2 border-gray-400/50 z-30 shadow-inner">
        {/* Titrant Liquid Level */}
        <div
          className="absolute top-0 w-full transition-all duration-300 ease-linear"
          style={{
            height: `${buretteLevelPercentage}%`,
            background: titrantColor
          }}
        ></div>
        {/* Burette Tip (Stopcock Area) */}
        <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-4 h-6 bg-gray-600 rounded-b-lg z-40"></div>

        {/* Burette Volume Labels (Mock) */}
        <div className="absolute inset-0 burette-markings">
          <div style={{ top: '0%' }}><span style={{ top: '-10px' }}>0</span></div>
          <div style={{ top: '25%' }}><span style={{ top: '-10px' }}>12.5</span></div>
          <div style={{ top: '50%' }}><span style={{ top: '-10px' }}>25</span></div>
          <div style={{ top: '75%' }}><span style={{ top: '-10px' }}>37.5</span></div>
          <div style={{ top: '100%' }}><span style={{ top: '-10px' }}>50</span></div>
        </div>
      </div>

      {/* 3. DROP ANIMATION */}
      <div className="absolute top-[380px] z-50">
        {isDropping && (
          <div className={`w-1 h-1 rounded-full bg-yellow-600 animate-drop`} key={volume}></div>
        )}
      </div>

      {/* 4. CONICAL FLASK */}
      <div className="absolute bottom-0 w-40 h-40">
        {/* Flask Neck */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-10 bg-gray-300/50 rounded-t-lg border-x-2 border-gray-400/50 z-30"></div>
        {/* Flask Body (Conical shape achieved with border-radius) */}
        <div className="w-full h-full bg-gray-200/50 rounded-b-[40px] rounded-t-sm border-x-2 border-b-4 border-gray-400/50 relative overflow-hidden shadow-2xl z-40">

          {/* Analyte Liquid (Acid + Indicator + Titrant) - Fixed height for a base volume */}
          <div
            className="absolute inset-x-0 bottom-0 transition-all duration-700 ease-linear"
            style={{ height: '70%', backgroundColor: flaskBackgroundColor, boxShadow: `0 0 10px 5px ${flaskBackgroundColor}` }}
          >
            {/* Stir Bar Animation */}
            {isStirring && (
              <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-2">
                <div className="w-full h-full bg-gray-800 rounded-full animate-stir shadow-lg"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. MAGNETIC STIRRER PLATE */}
      <div className="absolute bottom-[-10px] w-48 h-10 bg-gray-700 rounded-xl shadow-inner z-0 flex items-center justify-center">
        <div className="text-white font-mono text-xs">Magnetic Stirrer</div>
      </div>
    </div>
  );
};

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
  const [isDropping, setIsDropping] = useState(false); // New state

  const hasFinalizedRef = useRef(false);
  const [experimentTitle, setExperimentTitle] = useState(propExperimentTitle || "Titration");

  // New Effect for drop animation
  useEffect(() => {
    if (volume > 0) {
      setIsDropping(true);
      const timer = setTimeout(() => setIsDropping(false), 400); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [volume]);

  useEffect(() => {
    const handleBack = async () => {
      if (!isComplete) {
        await resetExperiment();
      }
    };
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [isComplete, runId]);

  // Start a run
  const start = async () => {
    try {
      const res = await api.post("/api/titration", { experimentId });
      setRunId(res.data._id);
      toast.success("Titration started");
    } catch (error) {
      toast.error("Failed to start run");
    }
  };

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
      if (vol >= 24.5 && vol <= 25.5) {
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

  // Reset
  const resetExperiment = async () => {
    try {
      if (runId) await api.delete(`/api/titration/${runId}`);
    } catch (err) {
      console.log(err);
    } finally {
      setVolume(0);
      setPH(1.2);
      setColor("#ff6b6b");
      setIsComplete(false);
      setObservations([]);
      setRunId(null);
      hasFinalizedRef.current = false;
      toast.info("Experiment reset");
    }
  };

  const backToDashboard = async () => {
    if (!isComplete && runId) {
      if (!confirm("Are you sure? This won't save your experiment.")) return;
      await resetExperiment();
    }
    navigate('/student/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <style>{STYLES}</style>

      {/* HEADER */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={backToDashboard} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Back to Dashboard</span>
          </Button>
          <h1 className="capitalize text-lg md:text-xl font-semibold text-center flex-1">
            {experimentTitle}
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetExperiment}
              disabled={isComplete}
              className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Reset</span>
            </Button>
            {runId ? (
              <Button size="sm" onClick={finalize} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 hidden md:inline" />
                <span>Complete</span>
              </Button>
            ) : (
              <Button size="sm" onClick={start} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 hidden md:inline" />
                <span>Start</span>
              </Button>
            )}
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
              </div>
            )}
          </Card>

          {/* Center Panel (Equipment) */}
          <Card className="glass-effect p-8 lg:col-span-1 flex flex-col items-center justify-center space-y-8">

            {/* 1. Digital pH Display (High Visibility) */}
            <div className="bg-gray-800 p-4 rounded-xl shadow-inner w-full text-center font-mono border-4 border-gray-700">
              <p className="text-sm text-gray-300 mb-1">REAL-TIME pH METER</p>
              <p className="text-6xl font-extrabold text-green-400 leading-none transition-all duration-300">
                {pH.toFixed(2)}
              </p>
              <div className="text-xs text-gray-400 mt-2">
                <span className={`px-2 py-0.5 rounded-full font-semibold ${pH <= 7 ? 'bg-red-700 text-white' : 'bg-blue-700 text-white'}`}>
                  {pH <= 7 ? 'ACIDIC' : 'BASIC'}
                </span>
              </div>
            </div>

            {/* 2. Titration Apparatus Visualization */}
            <TitrationApparatus
              volume={volume}
              color={color}
              isStirring={!!runId && !isComplete}
              isDropping={isDropping}
            />

            {/* Slider */}
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Volume Added (mL)</span>
                <span className="text-2xl font-bold font-mono text-primary">{volume.toFixed(1)}</span>
              </div>
              <Slider value={[volume]} onValueChange={handleVolumeChange} max={50} step={0.1} className="w-full" disabled={!runId || isComplete} />
              <p className="text-xs text-muted-foreground italic text-center">Slide to add Titrant (Base) dropwise. Total burette capacity: 50 mL.</p>
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
                <Button variant="outline" size="sm" className="w-full" onClick={recordCurrentState} disabled={!runId || isComplete}>
                  Record Current State
                </Button>

                <Button size="sm" className="w-full" onClick={() => {
                  addObservationLocal(`Quick note at ${volume.toFixed(1)} mL, pH ${pH.toFixed(2)}`);
                }} disabled={!runId || isComplete}>
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
