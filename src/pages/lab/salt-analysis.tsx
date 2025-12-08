import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, CheckCircle2, TestTube2, Flame, Droplet, Beaker, ClipboardList } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api/client";

/**
 * Salt Analysis - Practical qualitative analysis
 * Minimal & Attractive Design
 */

const CATIONS = [
  { id: "Fe3+", name: "Fe³⁺ (Ferric)", flameColor: "No distinct color", precipitate: "Reddish-brown with NaOH", color: "bg-red-800/90" },
  { id: "Cu2+", name: "Cu²⁺ (Cupric)", flameColor: "Green", precipitate: "Blue with NaOH", color: "bg-blue-600/90" },
  { id: "Zn2+", name: "Zn²⁺ (Zinc)", flameColor: "No distinct color", precipitate: "White with NaOH", color: "bg-slate-200/90" },
  { id: "Ca2+", name: "Ca²⁺ (Calcium)", flameColor: "Brick red", precipitate: "White with (NH₄)₂CO₃", color: "bg-slate-200/90" },
];

const ANIONS = [
  { id: "Cl-", name: "Cl⁻ (Chloride)", test: "AgNO₃", result: "White precipitate", precipitateColor: "bg-slate-200/90" },
  { id: "SO42-", name: "SO₄²⁻ (Sulfate)", test: "BaCl₂", result: "White precipitate", precipitateColor: "bg-slate-200/90" },
  { id: "NO3-", name: "NO₃⁻ (Nitrate)", test: "Brown ring test", result: "Brown ring", precipitateColor: "bg-amber-800/90" },
  { id: "CO32-", name: "CO₃²⁻ (Carbonate)", test: "Dilute acid", result: "Effervescence", precipitateColor: "bg-transparent" },
];

type Stage = "idle" | "preliminary" | "flame" | "confirmatory" | "complete";

type Props = {
  experimentId?: string;
  experimentTitle?: string;
};

// --- VISUALIZATION COMPONENT ---
const LabBenchVisualization: React.FC<{
  stage: Stage;
  phResult: string;
  flameColor: string;
  cationTests: Array<{ test: string, result: string }>;
  anionTests: Array<{ test: string, result: string }>;
  selectedCation: string;
  selectedAnion: string;
  isTestRunning: boolean;
}> = ({ stage, phResult, flameColor, cationTests, anionTests, selectedCation, selectedAnion, isTestRunning }) => {

  const [reactionStep, setReactionStep] = useState<number>(0);
  const [visualResultColor, setVisualResultColor] = useState<string>("transparent");
  const [showDrop, setShowDrop] = useState(false);

  useEffect(() => {
    if (isTestRunning) {
      setShowDrop(true);
      const timer = setTimeout(() => setShowDrop(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isTestRunning]);

  useEffect(() => {
    if (cationTests.length > 0) {
      const lastTest = cationTests[cationTests.length - 1];
      let colorClass = "bg-transparent";

      if (lastTest.result.includes("Reddish-brown")) colorClass = "bg-red-800/90";
      else if (lastTest.result.includes("Blue")) colorClass = "bg-blue-600/90";
      else if (lastTest.result.includes("White")) colorClass = "bg-slate-200/90";

      setVisualResultColor(colorClass);
      setReactionStep(3);
    } else if (anionTests.length > 0) {
      const lastTest = anionTests[anionTests.length - 1];
      let colorClass = "bg-transparent";

      if (lastTest.result.includes("Brown ring")) colorClass = "bg-amber-800/90";
      else if (lastTest.result.includes("Effervescence")) colorClass = "bg-slate-100/50";
      else if (lastTest.result.includes("White precipitate")) colorClass = "bg-slate-200/90";

      setVisualResultColor(colorClass);
      if (lastTest.result.includes("Effervescence")) {
        setReactionStep(4);
      } else if (lastTest.result.includes("Brown ring")) {
        setReactionStep(5);
      } else {
        setReactionStep(3);
      }
    } else {
      setVisualResultColor("transparent");
      setReactionStep(0);
    }
  }, [cationTests, anionTests]);

  useEffect(() => {
    if (stage === "preliminary" || stage === "confirmatory") {
      setReactionStep(1);
      setVisualResultColor("bg-slate-100/50");
    }
    if (stage === "idle") {
      setReactionStep(0);
      setVisualResultColor("transparent");
    }
  }, [stage]);


  let flameVisualColor = "slate-300";
  if (stage === "flame" || (stage === "confirmatory" && flameColor)) {
    if (flameColor.includes("Green")) flameVisualColor = "green-500";
    else if (flameColor.includes("Brick Red")) flameVisualColor = "red-600";
    else flameVisualColor = "yellow-400";
  }

  const initialSolutionColor = (stage === 'preliminary' || stage === 'confirmatory') ? 'bg-slate-100/50' : 'bg-transparent';

  let phColorClass = 'bg-slate-200';
  if (phResult === 'Acidic') phColorClass = 'bg-rose-400';
  else if (phResult === 'Basic') phColorClass = 'bg-blue-400';
  else if (phResult === 'Neutral') phColorClass = 'bg-emerald-400';

  const finalCation = CATIONS.find(c => c.id === selectedCation)?.name;
  const finalAnion = ANIONS.find(a => a.id === selectedAnion)?.name;

  if (stage === "flame") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 relative bg-white rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-semibold mb-6 text-slate-500 uppercase tracking-wider">Flame Test</h3>

        <div className="w-16 h-12 bg-slate-700 rounded-t-lg relative mt-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-6 bg-slate-500 rounded-b-sm"></div>
        </div>

        <div className="relative w-24 h-32 -mt-4">
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-20 rounded-full bg-yellow-400/20 blur-xl transition-colors duration-500`} style={{
            boxShadow: `0 0 40px 10px ${flameVisualColor === 'slate-300' ? '#fde047' : (flameVisualColor.includes('green') ? '#4ade80' : '#f87171')}`,
            opacity: stage === 'flame' ? 0.6 : 0.2,
          }}></div>
          <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-16 rounded-full bg-white/40 transition-colors duration-500`}></div>

          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-24 rounded-full bg-${flameVisualColor} transition-colors duration-700 ease-in-out`} style={{
            opacity: stage === "flame" ? 0.9 : 0,
            clipPath: 'polygon(50% 0%, 80% 30%, 50% 100%, 20% 30%)',
            animation: 'flicker 0.1s infinite alternate'
          }}></div>
        </div>

        <p className="text-sm font-medium text-slate-600 mt-8 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
          Observed: <span className={`font-bold text-${flameVisualColor}`}>{flameColor || 'Heating...'}</span>
        </p>
        <style>{`
              @keyframes flicker {
                0% { transform: translateX(-50%) scale(1); opacity: 0.9; }
                100% { transform: translateX(-50%) scale(1.05); opacity: 0.8; }
              }
            `}</style>
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center justify-center h-full p-8 relative bg-white rounded-xl border border-slate-100 shadow-sm">
      <h3 className="text-sm font-semibold mb-6 text-slate-500 uppercase tracking-wider">Lab Bench</h3>

      <div className="relative w-32 h-80 flex items-center justify-center">
        <svg className="w-full h-full drop-shadow-xl" viewBox="0 0 100 250" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M25 5C25 2.23858 27.2386 0 30 0H70C72.7614 0 75 2.23858 75 5V220C75 236.569 61.5685 250 45 250C28.4315 250 15 236.569 15 236.569 15 220V5H25Z" fill="rgba(255,255,255,0.2)" className="stroke-slate-300 stroke-[1.5px]" />

          {/* Reagent Drop Animation */}
          <circle cx="50" cy="0" r="4" fill="#3b82f6" className={`transition-all duration-700 ease-in ${showDrop ? 'opacity-100 translate-y-[120px]' : 'opacity-0 translate-y-0'}`} />

          <rect x="26" y="100" width="48" height="120" rx="10" className={`${initialSolutionColor} transition-colors duration-1000`} />

          <rect
            x="26" y="180" width="48" height="40" rx="8"
            className={`${visualResultColor} transition-all duration-1000 ease-out`}
            style={{
              opacity: reactionStep >= 3 ? 1 : 0,
              transform: reactionStep === 5 ? 'translateY(-60px)' : 'translateY(0)',
            }}
          />

          {reactionStep === 4 && (
            <g className="animate-pulse">
              {[...Array(6)].map((_, i) => (
                <circle key={i} r="2" fill="rgba(255,255,255,0.8)" className="animate-bubble">
                  <animateMotion
                    dur={`${1.5 + i * 0.2}s`}
                    repeatCount="indefinite"
                    path={`M${40 + (i % 3) * 10},200 L${40 + (i % 3) * 10 + (i % 2 === 0 ? 2 : -2)},120`}
                    begin={`${i * 0.1}s`}
                  />
                  <animate attributeName="opacity" values="0;1;0" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" begin={`${i * 0.1}s`} />
                </circle>
              ))}
            </g>
          )}
        </svg>

        {(stage === "preliminary" && phResult) && (
          <div className={`absolute top-20 left-1/2 -translate-x-1/2 w-4 h-16 rounded shadow-md border border-white/50 ${phColorClass} transition-all duration-700 ease-out transform origin-top animate-dip`}>
          </div>
        )}
      </div>

      <div className={`mt-6 text-center transition-all duration-500 ${stage === 'idle' || stage === 'complete' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100">
          {stage === 'preliminary' && "Testing pH..."}
          {stage === 'confirmatory' && "Analyzing Reaction..."}
        </span>
      </div>

      {stage === 'complete' && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
          <div className="text-center p-6 animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-1">Analysis Complete</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <p>Cation: <span className="font-semibold text-slate-900">{finalCation}</span></p>
              <p>Anion: <span className="font-semibold text-slate-900">{finalAnion}</span></p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dip {
          0% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
          50% { transform: translateX(-50%) translateY(0); opacity: 1; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        .animate-dip { animation: dip 0.5s forwards; }
      `}</style>

    </div>
  );
};

// --- MAIN COMPONENT ---
const SaltAnalysis: React.FC<Props> = ({ experimentId: propExperimentId, experimentTitle: propExperimentTitle }) => {
  const { id: experimentId } = useParams();
  const [runId, setRunId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");

  const [phResult, setPhResult] = useState<string>("");
  const [flameTestDone, setFlameTestDone] = useState(false);
  const [flameColor, setFlameColor] = useState<string>("");
  const [selectedCation, setSelectedCation] = useState<string>("");
  const [selectedAnion, setSelectedAnion] = useState<string>("");

  const [cationTests, setCationTests] = useState<Array<{ test: string, result: string }>>([]);
  const [anionTests, setAnionTests] = useState<Array<{ test: string, result: string }>>([]);
  const [observations, setObservations] = useState<string[]>([]);

  const [completed, setCompleted] = useState(false);

  const experimentTitle = propExperimentTitle || "Salt Analysis";
  const navigate = useNavigate();

  useEffect(() => {
    const handleBack = async () => {
      if (isRunning && runId) {
        await resetExperiment();
      }
    };
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [isRunning, runId]);

  const addObservation = (message: string) => {
    const obs = `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${message}`;
    setObservations(prev => [obs, ...prev]);
  };

  const startRun = async () => {
    try {
      const res = await api.post("/api/saltanalysis", { experimentId });
      setRunId(res.data._id);
      setIsRunning(true);
      setStage("preliminary");
      toast.success("Experiment Started");
      addObservation("Experiment started.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to start");
    }
  };

  const performPHTest = async (ph: string) => {
    if (stage !== "preliminary" || phResult) return;
    setPhResult(ph);
    addObservation(`pH Test: ${ph}`);
    if (runId) await api.post(`/api/saltanalysis/${runId}/observations`, { message: `pH Test: ${ph}`, testType: "preliminary", testName: "pH Test", result: ph });
    setStage("flame");
  };

  const performFlameTest = async (color: string) => {
    if (stage !== "flame" && stage !== "preliminary") return;
    setStage("flame");
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFlameColor(color);
    setFlameTestDone(true);
    addObservation(`Flame Test: ${color}`);
    if (runId) await api.post(`/api/saltanalysis/${runId}/observations`, { message: `Flame Test: ${color}`, testType: "preliminary", testName: "Flame Test", result: color });
    setStage("confirmatory");
  };

  const performCationTest = async (reagent: string, observation: string) => {
    if (stage !== "confirmatory") return;
    setIsTestRunning(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsTestRunning(false);
    setCationTests(prev => [...prev, { test: reagent, result: observation }]);
    addObservation(`Cation Test (${reagent}): ${observation}`);
    if (runId) await api.post(`/api/saltanalysis/${runId}/observations`, { message: `Cation test: ${reagent} - ${observation}`, testType: "confirmatory", testName: `Cation Test (${reagent})`, reagent, observation });
  };

  const performAnionTest = async (reagent: string, observation: string) => {
    if (stage !== "confirmatory") return;
    setIsTestRunning(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsTestRunning(false);
    setAnionTests(prev => [...prev, { test: reagent, result: observation }]);
    addObservation(`Anion Test (${reagent}): ${observation}`);
    if (runId) await api.post(`/api/saltanalysis/${runId}/observations`, { message: `Anion test: ${reagent} - ${observation}`, testType: "confirmatory", testName: `Anion Test (${reagent})`, reagent, observation });
  };

  const completeExperiment = async () => {
    if (!runId || stage === "complete") return;
    if (!selectedCation || !selectedAnion) {
      toast.error("Select both cation and anion");
      return;
    }
    try {
      const cationName = CATIONS.find(c => c.id === selectedCation)?.name || selectedCation;
      const anionName = ANIONS.find(a => a.id === selectedAnion)?.name || selectedAnion;
      const finalResult = `${cationName} + ${anionName}`;
      await api.post(`/api/saltanalysis/${runId}/finalize`, { detectedCation: cationName, detectedAnion: anionName, finalResult });
      setStage("complete");
      toast.success("Completed", { description: finalResult });
      addObservation(`Result: ${finalResult}`);
      setIsRunning(false);
      setCompleted(true);
    } catch (err) {
      console.error(err);
      toast.error("Error completing experiment");
    }
  };

  const resetExperiment = async () => {
    try {
      if (runId) await api.delete(`/api/saltanalysis/${runId}`);
    } catch (err) { console.log(err); }
    finally {
      setRunId(null); setIsRunning(false); setStage("idle");
      setPhResult(""); setFlameTestDone(false); setFlameColor("");
      setSelectedCation(""); setSelectedAnion("");
      setCationTests([]); setAnionTests([]); setObservations([]);
      toast.info("Experiment reset");
    }
  };

  const backToDashboard = async () => {
    if (isRunning && runId) {
      if (!confirm("Are you sure? This won't save your experiment.")) return;
      await resetExperiment();
    }
    navigate('/student/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Minimal Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button onClick={backToDashboard}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold tracking-tight text-slate-800">{experimentTitle}</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" disabled={!isRunning} onClick={resetExperiment} className="text-slate-500 hover:text-slate-800 hover:bg-slate-100">
              <RotateCcw className="w-4 h-4" />
            </Button>
            {isRunning && stage !== "complete" && (
              <Button size="sm" onClick={completeExperiment} disabled={!selectedCation || !selectedAnion} className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
                Complete
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">

          {/* LEFT: Controls */}
          <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">

            {!isRunning ? (
              <Card className="p-8 flex flex-col items-center justify-center text-center h-full border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50">
                <Beaker className="w-12 h-12 text-slate-300 mb-4" />
                <h2 className="text-xl font-semibold text-slate-700 mb-2">Start Analysis</h2>
                <p className="text-slate-500 text-sm mb-6">Begin the systematic qualitative analysis of the unknown salt.</p>
                <Button onClick={startRun} disabled={completed} size="lg" className="bg-slate-900 text-white hover:bg-slate-800 shadow-md w-full max-w-xs">
                  Start Experiment
                </Button>
              </Card>
            ) : (
              <>
                {/* Stage 1: Preliminary */}
                <Card className={`p-5 border-slate-200 shadow-sm transition-all duration-300 ${stage === 'preliminary' || stage === 'flame' ? 'ring-2 ring-teal-500/10 bg-white' : 'opacity-60 bg-slate-50'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Droplet className="w-4 h-4" /></div>
                    <h3 className="font-semibold text-slate-800">Preliminary Tests</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">pH Test</label>
                      <div className="flex gap-2">
                        {["Acidic", "Neutral", "Basic"].map(ph => (
                          <button
                            key={ph}
                            onClick={() => performPHTest(ph)}
                            disabled={!!phResult || stage !== "preliminary"}
                            className={`flex-1 py-2 text-sm rounded-md border transition-all ${phResult === ph ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                          >
                            {ph}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Flame Test</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Green", "Brick Red", "No Color"].map(color => (
                          <button
                            key={color}
                            onClick={() => performFlameTest(color)}
                            disabled={flameTestDone || !phResult || stage === "confirmatory"}
                            className={`py-2 px-3 text-sm rounded-md border text-left transition-all ${flameColor === color ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'} ${color === 'No Color' ? 'col-span-2' : ''}`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Stage 2: Confirmatory */}
                <Card className={`p-5 border-slate-200 shadow-sm transition-all duration-300 ${stage === 'confirmatory' || stage === 'complete' ? 'ring-2 ring-teal-500/10 bg-white' : 'opacity-60 bg-slate-50'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><TestTube2 className="w-4 h-4" /></div>
                    <h3 className="font-semibold text-slate-800">Confirmatory Tests</h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Cation Analysis</label>
                      <div className="space-y-2 mb-3">
                        {CATIONS.filter(c => c.id !== 'Ca2+').map(c => (
                          <button
                            key={c.id}
                            onClick={() => performCationTest("NaOH", c.precipitate)}
                            disabled={stage === "complete" || stage !== "confirmatory"}
                            className="w-full text-left px-3 py-2 text-sm border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors text-slate-600"
                          >
                            Add NaOH <span className="text-slate-400 text-xs ml-1">({c.id})</span>
                          </button>
                        ))}
                      </div>
                      <select
                        className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        value={selectedCation}
                        onChange={(e) => setSelectedCation(e.target.value)}
                        disabled={stage === "complete"}
                      >
                        <option value="">Select Identified Cation</option>
                        {CATIONS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Anion Analysis</label>
                      <div className="space-y-2 mb-3">
                        {ANIONS.map(a => (
                          <button
                            key={a.id}
                            onClick={() => performAnionTest(a.test, a.result)}
                            disabled={stage === "complete" || stage !== "confirmatory"}
                            className="w-full text-left px-3 py-2 text-sm border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors text-slate-600"
                          >
                            {a.test} <span className="text-slate-400 text-xs ml-1">({a.id})</span>
                          </button>
                        ))}
                      </div>
                      <select
                        className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        value={selectedAnion}
                        onChange={(e) => setSelectedAnion(e.target.value)}
                        disabled={stage === "complete"}
                      >
                        <option value="">Select Identified Anion</option>
                        {ANIONS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* CENTER: Visualization */}
          <div className="lg:col-span-5 h-full">
            <LabBenchVisualization
              stage={stage}
              phResult={phResult}
              flameColor={flameColor}
              cationTests={cationTests}
              anionTests={anionTests}
              selectedCation={selectedCation}
              selectedAnion={selectedAnion}
              isTestRunning={isTestRunning}
            />
          </div>

          {/* RIGHT: Notebook */}
          <div className="lg:col-span-3 flex flex-col h-full">
            <Card className="h-full border-slate-200 shadow-sm bg-white flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <ClipboardList className="w-4 h-4" />
                  <span>Lab Notebook</span>
                </div>
                <span className="text-xs text-slate-400">{observations.length} entries</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {observations.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                    <p>No observations recorded.</p>
                  </div>
                ) : (
                  observations.map((obs, idx) => (
                    <div key={idx} className="text-sm p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-600 animate-in slide-in-from-top-2 duration-300">
                      {obs}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}

export default SaltAnalysis;