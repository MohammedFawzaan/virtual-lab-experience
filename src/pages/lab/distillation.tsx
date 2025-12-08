import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, RotateCcw, BookOpen, CheckCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api/client";
import { useNavigate } from "react-router-dom";

// --- STYLES CONSTANT: Contains all @keyframes and custom classes for the visualization ---
const STYLES = `
  @keyframes bubble {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-30px) scale(0.5); opacity: 0; }
  }
  @keyframes vapor-flow {
    0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
    100% { transform: translate(40px, -20px) scale(0.8); opacity: 0; }
  }
  @keyframes heat-glow {
    0%, 100% { box-shadow: 0 0 8px #ff8800, 0 0 20px #ff4500; }
    50% { box-shadow: 0 0 4px #ffcc00, 0 0 15px #ff6600; }
  }
  @keyframes drop {
    0% { transform: translateY(-5px); opacity: 1; }
    100% { transform: translateY(15px); opacity: 0; }
  }

  .animate-bubble { animation: bubble 1.5s infinite linear; }
  .animate-vapor { animation: vapor-flow 1.5s infinite alternate cubic-bezier(0.4, 0, 0.6, 1); }
  .animate-heat { animation: heat-glow 1.2s infinite alternate; }
  .animate-drop { animation: drop 0.5s linear forwards; }
  
  /* Adjusted Glass Effect for Light Mode */
  .glass-effect { 
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(8px) saturate(180%);
    border: 1px solid rgba(220, 220, 220, 0.8);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
`;

// --- Apparatus Visualization Component ---
const ApparatusVisualization = ({ temperature, vaporRate, collectedVolume, isBoiling, color }: {
  temperature: number;
  vaporRate: number;
  collectedVolume: number;
  isBoiling: boolean;
  color: string;
}) => {
  // Calculated size for visualization elements
  const liquidHeight = Math.max(0, 100 - collectedVolume * 4); // Start at 100, drops by 4% per mL collected
  const distillateHeight = collectedVolume * 4; // Max 100% for 25mL
  const heatIntensity = Math.min(1, Math.max(0, (temperature - 20) / 80)); // 0% at 20C, 100% at 100C

  // Use a fixed width/height container for the visualization
  return (
    // FIX: Added a distinct background (bg-gray-100) to ensure the glassware is visible against the white card.
    <div className="relative w-full h-[350px] flex items-center justify-center pt-10 bg-gray-100 rounded-xl border border-gray-200">
      {/* The main apparatus container */}
      <div className="relative w-full max-w-lg h-full scale-100 origin-top">

        {/* 1. Heating Mantle */}
        <div
          className={`absolute bottom-[60px] left-[calc(50%-45px)] w-[90px] h-[50px] rounded-b-xl rounded-t-lg transition-all duration-300 shadow-xl z-20 ${isBoiling ? 'animate-heat bg-red-600' : 'bg-red-700/80'}`}
        >
          <div className={`absolute top-0 w-full h-1/2 rounded-t-lg transition-opacity duration-300 ${isBoiling ? 'opacity-80 bg-orange-400/50 blur-sm' : 'opacity-0'}`}
            style={{ opacity: heatIntensity * 0.8 }}
          ></div>
        </div>

        {/* 2. Round Bottom Flask */}
        <div className="absolute bottom-[80px] left-[calc(50%-40px)] w-20 h-20 rounded-full glass-effect overflow-hidden z-30 border-2 border-gray-400/50">
          {/* Liquid */}
          <div
            className="absolute inset-x-0 bottom-0 transition-all duration-1000"
            style={{ height: `${liquidHeight}%`, backgroundColor: color }}
          >
            {/* Bubbling Animation */}
            {isBoiling && (
              <>
                <div className="absolute w-2 h-2 rounded-full bg-white/80 animate-bubble" style={{ left: '20%', animationDelay: '0s' }}></div>
                <div className="absolute w-1 h-1 rounded-full bg-white/80 animate-bubble" style={{ left: '50%', animationDelay: '0.5s' }}></div>
                <div className="absolute w-3 h-3 rounded-full bg-white/80 animate-bubble" style={{ left: '80%', animationDelay: '1s' }}></div>
              </>
            )}
          </div>
        </div>
        {/* Flask Neck */}
        <div className="absolute bottom-[160px] left-[calc(50%-15px)] w-8 h-12 bg-gray-300/50 glass-effect z-30"></div>

        {/* 3. Distillation Head & Thermometer */}
        <div className="absolute top-[125px] left-[calc(50%-15px)] z-40">
          {/* Distillation Head - Main Body (connects condenser & thermometer) */}
          <div className="w-8 h-10 bg-gray-300/50 glass-effect rounded-t-lg"></div>

          {/* Connector to Condenser (Horizontal Arm) */}
          <div className="absolute w-[80px] h-4 bg-gray-300/50 glass-effect rounded-r-full translate-x-[20px] translate-y-[-24px] rotate-[0deg]"></div>

          {/* Thermometer */}
          <div className="absolute w-2 h-20 bg-gray-500/80 rounded-b-sm translate-x-[9px] translate-y-[-90px] shadow-lg overflow-hidden">
            {/* Rising Temperature Bar (Mercury/Alcohol) */}
            <div
              className="absolute bottom-0 w-full bg-red-500 transition-all duration-1000"
              style={{ height: `${Math.min(100, temperature / 1.5)}%` }} // Scaling temp to 150 max
            ></div>
            <div className="absolute -top-6 -left-10 text-xs text-gray-800 bg-white/80 p-1 rounded-sm shadow-sm font-bold">{temperature}°C</div>
          </div>
        </div>

        {/* 4. Vapor Animation (Along the horizontal arm) */}
        {isBoiling && (
          <div className="absolute w-20 h-5 top-[155px] left-[calc(50%+15px)] z-50 overflow-hidden" style={{ opacity: Math.min(1, vaporRate / 10) }}>
            <div className="absolute w-2 h-2 rounded-full bg-gray-200/90 animate-vapor" style={{ left: '0px', top: '0px', animationDelay: '0s' }}></div>
            <div className="absolute w-1 h-1 rounded-full bg-gray-200/90 animate-vapor" style={{ left: '5px', top: '5px', animationDelay: '0.5s' }}></div>
            <div className="absolute w-3 h-3 rounded-full bg-gray-200/90 animate-vapor" style={{ left: '10px', top: '10px', animationDelay: '1s' }}></div>
          </div>
        )}

        {/* 5. Liebig Condenser */}
        <div className="absolute top-[135px] left-[calc(50%+65px)] z-20">
          {/* Condenser Jacket (Outer) - Water Flow */}
          <div className={`absolute -top-2 left-0 w-[120px] h-6 rounded-full opacity-50 bg-cyan-200`}></div>
          {/* Condenser Tube (Inner - where condensation happens) */}
          <div className="w-[120px] h-2 bg-gray-300/50 glass-effect relative z-10"></div>
        </div>

        {/* 6. Receiving Flask & Distillate Drop */}
        <div className="relative translate-x-[150px] translate-y-[200px] z-20">
          {/* Drop Animation */}
          {collectedVolume > 0 && isBoiling && (
            <div className="absolute w-1 h-1 rounded-full bg-green-500/80 -top-5 left-[50px] animate-drop"></div>
          )}
          {/* Receiving Flask Neck */}
          <div className="w-8 h-8 mx-auto bg-gray-300/50 glass-effect border-b-2 border-gray-400/50"></div>
          {/* Receiving Flask Body */}
          <div className="w-16 h-16 rounded-b-xl rounded-t-sm glass-effect mx-auto overflow-hidden border-2 border-gray-400/50">
            {/* Collected Distillate */}
            <div
              className="absolute inset-x-0 bottom-0 bg-green-500/40 transition-all duration-1000"
              style={{ height: `${distillateHeight}%` }}
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
};

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

  useEffect(() => {
    const handleBack = async () => {
      if (!isComplete && runId) {
        await resetExperiment();
      }
    };
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [isComplete, runId]);

  // Start a run
  const start = async () => {
    try {
      const res = await api.post("/api/distillation", { experimentId });
      setRunId(res.data._id);
      toast.success("Distillation started");
    } catch (error) {
      toast.error("Failed to start run");
    }
  }

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
      setCollectedVolume((v) => Math.min(25, v + 0.1)); // Adjusted for fluid experience
    } else if (t >= 100) {
      setIsBoiling(true);
      setVaporRate(15 + (t - 100) * 0.2);
      setColor("#e0f7ff");
      setCollectedVolume((v) => Math.min(30, v + 0.3)); // Increased max collected slightly for manual control
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

  // Reset
  const resetExperiment = async () => {
    try {
      if (runId) await api.delete(`/api/distillation/${runId}`);
    } catch (err) {
      console.log(err);
    }
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
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">

      {/* --- INLINE CSS (Placed here for execution) --- */}
      <style>{STYLES}</style>

      {/* HEADER */}
      <header className="border-b border-gray-200/50 backdrop-blur-sm bg-white/90 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* BACK BUTTON */}
          <Button variant="ghost" size="sm" onClick={backToDashboard} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Back to Dashboard</span>
          </Button>
          {/* TITLE */}
          <h1 className="capitalize text-lg md:text-xl font-bold text-center flex-1 text-blue-600">
            {experimentTitle}
          </h1>
          {/* ACTION BUTTONS */}
          <div className="flex gap-2">
            {/* RESET */}
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
              <Button
                size="sm"
                onClick={finalize}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                disabled={isComplete || isSaving}
              >
                <CheckCircle className="w-4 h-4 hidden md:inline" />
                <span>{isComplete ? 'Completed' : 'Complete Experiment'}</span>
              </Button>
            ) : (
              <Button size="sm" onClick={start} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 hidden md:inline" />
                <span>Start Experiment</span>
              </Button>
            )}
          </div>
        </div>
      </header>


      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Panel */}
          <Card className="p-6 space-y-6 lg:col-span-1 glass-effect">
            <div className="flex items-center gap-2 text-blue-600">
              <BookOpen className="w-5 h-5" />
              <h2 className="text-xl font-semibold text-gray-800">Distillation Process</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-blue-600">Objective</h3>
                <p className="text-sm text-gray-600">
                  Separate components of a mixture based on their boiling points by heating and condensing.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-blue-600">Procedure</h3>
                <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                  <li>Increase temperature using the slider</li>
                  <li>Observe boiling and vapor formation</li>
                  <li>Collect distillate in the receiving flask</li>
                  <li>**Manual Stop:** Press 'Complete Experiment' when finished.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-red-500">Safety Notes</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Monitor temperature closely</li>
                  <li>• Ensure proper cooling water flow (Simulated)</li>
                  <li>• Do not let the flask boil dry</li>
                </ul>
              </div>
            </div>

            {isComplete && (
              <div className="p-4 rounded-lg bg-green-100 border border-green-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✨</span>
                  <h3 className="font-semibold text-green-700">Experiment Complete!</h3>
                </div>
                <p className="text-sm text-gray-600">
                  You've successfully completed the distillation. Data saved to your profile.
                </p>
              </div>
            )}
          </Card>

          {/* Center Panel (Equipment) */}
          <Card className="glass-effect p-4 lg:col-span-1 flex flex-col items-center justify-start space-y-4">
            <div className="text-center space-y-2 pt-4">
              <h2 className="text-2xl font-bold text-blue-600">Distillation Setup</h2>
              <p className="text-sm text-gray-500">Control heat to separate components</p>
            </div>

            {/* Visual Representation */}
            <ApparatusVisualization
              temperature={temperature}
              vaporRate={vaporRate}
              collectedVolume={collectedVolume}
              isBoiling={isBoiling}
              color={color}
            />

            {/* Slider */}
            <div className="w-full space-y-4 p-4 pt-0">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Heater Temperature (°C)</span>
                <span className="text-2xl font-bold font-mono text-red-500">{temperature}</span>
              </div>
              <Slider
                value={[temperature]}
                onValueChange={handleTemperatureChange}
                max={150}
                step={1}
                className="w-full"
                disabled={!runId || isComplete}
              />
            </div>
          </Card>

          {/* Right Panel (Measurements & Observations) */}
          <Card className="glass-effect p-6 space-y-6 lg:col-span-1">
            <h2 className="text-xl font-semibold text-blue-600">Measurements</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-200/50">
                <div className="text-sm text-gray-500 mb-1">Vapor Rate (Arbitrary Units)</div>
                <div className="text-3xl font-bold font-mono text-yellow-600">{vaporRate.toFixed(2)}</div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-200/50">
                <div className="text-sm text-gray-500 mb-1">Collected Volume (Target 25mL)</div>
                <div className="text-3xl font-bold font-mono text-green-600">{collectedVolume.toFixed(1)} mL</div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-200/50">
                <div className="text-sm text-gray-500 mb-1">Flask Status</div>
                <div className="text-lg font-semibold text-gray-700">
                  {temperature < 60 && "Ambient"}
                  {temperature >= 60 && temperature < 90 && "Heating"}
                  {isBoiling && <span className="text-red-500">Vaporizing & Distilling ⚗️</span>}
                  {isComplete && <span className="text-green-600">Finished ✅</span>}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Observations</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto bg-gray-100 p-2 rounded-lg border border-gray-200">
                {observations.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No observations yet. Click 'Start Experiment' and adjust temperature.</p>
                ) : (
                  observations.map((obs, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white shadow-sm text-sm text-gray-700">{obs}</div>
                  ))
                )}
              </div>

              <div className="mt-4 space-y-2">
                <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-400 hover:bg-blue-50" onClick={recordCurrentState} disabled={isComplete || !runId || isSaving}>
                  {isSaving ? 'Saving...' : 'Record Current State'}
                </Button>

                <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => {
                  addObservationLocal(`Quick note: Current temp is ${temperature}°C`);
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

export default Distillation;