import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, CheckCircle2, TestTube2, Flame, Droplet } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api/client";

/**
 * Salt Analysis - Practical qualitative analysis
 * Students perform systematic tests to identify cations and anions
 */

const CATIONS = [
  { id: "Fe3+", name: "Fe³⁺ (Ferric)", flameColor: "No distinct color", precipitate: "Reddish-brown with NaOH" },
  { id: "Cu2+", name: "Cu²⁺ (Cupric)", flameColor: "Green", precipitate: "Blue with NaOH" },
  { id: "Zn2+", name: "Zn²⁺ (Zinc)", flameColor: "No distinct color", precipitate: "White with NaOH" },
  { id: "Ca2+", name: "Ca²⁺ (Calcium)", flameColor: "Brick red", precipitate: "White with (NH₄)₂CO₃" },
];

const ANIONS = [
  { id: "Cl-", name: "Cl⁻ (Chloride)", test: "AgNO₃", result: "White precipitate" },
  { id: "SO42-", name: "SO₄²⁻ (Sulfate)", test: "BaCl₂", result: "White precipitate" },
  { id: "NO3-", name: "NO₃⁻ (Nitrate)", test: "Brown ring test", result: "Brown ring" },
  { id: "CO32-", name: "CO₃²⁻ (Carbonate)", test: "Dilute acid", result: "Effervescence" },
];

export default function SaltAnalysis() {
  const { id: experimentId } = useParams();
  const [runId, setRunId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Test stages
  const [stage, setStage] = useState<"idle" | "preliminary" | "flame" | "confirmatory" | "complete">("idle");

  // Test results
  const [phResult, setPhResult] = useState<string>("");
  const [flameTestDone, setFlameTestDone] = useState(false);
  const [flameColor, setFlameColor] = useState<string>("");
  const [selectedCation, setSelectedCation] = useState<string>("");
  const [selectedAnion, setSelectedAnion] = useState<string>("");

  // Confirmatory tests
  const [cationTests, setCationTests] = useState<Array<{ test: string, result: string }>>([]);
  const [anionTests, setAnionTests] = useState<Array<{ test: string, result: string }>>([]);

  // Observations
  const [observations, setObservations] = useState<string[]>([]);

  const addObservation = (message: string) => {
    const obs = `${new Date().toLocaleTimeString()}: ${message}`;
    setObservations(prev => [...prev, obs]);
  };

  const startRun = async () => {
    try {
      const res = await api.post("/api/saltanalysis", { experimentId });
      setRunId(res.data._id);
      setIsRunning(true);
      setStage("preliminary");
      toast.success("Salt Analysis Started");
      addObservation("Experiment started");
    } catch (err) {
      console.error(err);
      toast.error("Failed to start experiment");
    }
  };

  const performPHTest = async (ph: string) => {
    setPhResult(ph);
    addObservation(`pH Test: ${ph}`);

    if (runId) {
      await api.post(`/api/saltanalysis/${runId}/observations`, {
        message: `pH Test: ${ph}`,
        testType: "preliminary",
        testName: "pH Test",
        result: ph
      });
    }

    toast.success(`pH: ${ph}`);
  };

  const performFlameTest = async (color: string) => {
    setFlameColor(color);
    setFlameTestDone(true);
    setStage("confirmatory");
    addObservation(`Flame Test: ${color}`);

    if (runId) {
      await api.post(`/api/saltanalysis/${runId}/observations`, {
        message: `Flame Test: ${color}`,
        testType: "preliminary",
        testName: "Flame Test",
        result: color
      });
    }

    toast.success(`Flame color: ${color}`);
  };

  const performCationTest = async (reagent: string, observation: string) => {
    const test = { test: reagent, result: observation };
    setCationTests(prev => [...prev, test]);
    addObservation(`Cation test with ${reagent}: ${observation}`);

    if (runId) {
      await api.post(`/api/saltanalysis/${runId}/observations`, {
        message: `Cation test: ${reagent} - ${observation}`,
        testType: "confirmatory",
        testName: `Cation Test (${reagent})`,
        reagent,
        observation
      });
    }

    toast.success("Cation test recorded");
  };

  const performAnionTest = async (reagent: string, observation: string) => {
    const test = { test: reagent, result: observation };
    setAnionTests(prev => [...prev, test]);
    addObservation(`Anion test with ${reagent}: ${observation}`);

    if (runId) {
      await api.post(`/api/saltanalysis/${runId}/observations`, {
        message: `Anion test: ${reagent} - ${observation}`,
        testType: "confirmatory",
        testName: `Anion Test (${reagent})`,
        reagent,
        observation
      });
    }

    toast.success("Anion test recorded");
  };

  const completeExperiment = async () => {
    if (!runId) return;

    if (!selectedCation || !selectedAnion) {
      toast.error("Please select both cation and anion");
      return;
    }

    try {
      const cationName = CATIONS.find(c => c.id === selectedCation)?.name || selectedCation;
      const anionName = ANIONS.find(a => a.id === selectedAnion)?.name || selectedAnion;
      const finalResult = `${cationName} + ${anionName}`;

      await api.post(`/api/saltanalysis/${runId}/finalize`, {
        detectedCation: cationName,
        detectedAnion: anionName,
        finalResult
      });

      setStage("complete");
      toast.success("Experiment Completed!", { description: finalResult });
      addObservation(`Final Result: ${finalResult}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete experiment");
    }
  };

  const resetExperiment = () => {
    setRunId(null);
    setIsRunning(false);
    setStage("idle");
    setPhResult("");
    setFlameTestDone(false);
    setFlameColor("");
    setSelectedCation("");
    setSelectedAnion("");
    setCationTests([]);
    setAnionTests([]);
    setObservations([]);
    toast.info("Experiment Reset");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/student/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Salt Analysis — Qualitative Analysis</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetExperiment}>
                <RotateCcw className="w-4 h-4 mr-2" /> Reset
              </Button>
              {isRunning && stage !== "complete" && (
                <Button size="sm" onClick={completeExperiment} disabled={!selectedCation || !selectedAnion}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Complete
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Panel - Instructions */}
          <Card className="glass-effect p-6 space-y-6 lg:col-span-1">
            <div className="flex items-center gap-2">
              <TestTube2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Salt Analysis</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2 text-primary">Objective</h3>
                <p className="text-sm text-muted-foreground">
                  Identify unknown cation and anion through systematic qualitative analysis.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 text-primary">Procedure</h3>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Start the experiment</li>
                  <li>Perform preliminary tests (pH, flame)</li>
                  <li>Conduct confirmatory tests for cation</li>
                  <li>Conduct confirmatory tests for anion</li>
                  <li>Identify and record results</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 text-primary">Current Stage</h3>
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                  <p className="text-sm font-semibold capitalize">{stage}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Center Panel - Tests */}
          <Card className="glass-effect p-8 lg:col-span-1 space-y-6">
            {!isRunning ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <TestTube2 className="w-16 h-16 text-primary/50" />
                <h2 className="text-2xl font-bold text-center">Ready to Begin</h2>
                <p className="text-sm text-muted-foreground text-center">
                  Start the salt analysis experiment
                </p>
                <Button onClick={startRun} size="lg" className="mt-4">
                  Start Experiment
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Preliminary Tests */}
                {stage === "preliminary" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Droplet className="w-5 h-5" />
                      Preliminary Tests
                    </h3>

                    {/* pH Test */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">pH Test</label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={phResult === "Acidic" ? "default" : "outline"}
                          size="sm"
                          onClick={() => performPHTest("Acidic")}
                        >
                          Acidic
                        </Button>
                        <Button
                          variant={phResult === "Neutral" ? "default" : "outline"}
                          size="sm"
                          onClick={() => performPHTest("Neutral")}
                        >
                          Neutral
                        </Button>
                        <Button
                          variant={phResult === "Basic" ? "default" : "outline"}
                          size="sm"
                          onClick={() => performPHTest("Basic")}
                        >
                          Basic
                        </Button>
                      </div>
                    </div>

                    {/* Flame Test */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Flame className="w-4 h-4" />
                        Flame Test
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={flameColor === "Green" ? "default" : "outline"}
                          size="sm"
                          onClick={() => performFlameTest("Green")}
                        >
                          Green
                        </Button>
                        <Button
                          variant={flameColor === "Brick Red" ? "default" : "outline"}
                          size="sm"
                          onClick={() => performFlameTest("Brick Red")}
                        >
                          Brick Red
                        </Button>
                        <Button
                          variant={flameColor === "No Color" ? "default" : "outline"}
                          size="sm"
                          onClick={() => performFlameTest("No Color")}
                          className="col-span-2"
                        >
                          No Distinct Color
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirmatory Tests */}
                {(stage === "confirmatory" || stage === "complete") && (
                  <div className="space-y-6">
                    {/* Cation Tests */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Cation Tests</h3>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => performCationTest("NaOH", "Reddish-brown precipitate")}
                        >
                          Add NaOH (for Fe³⁺)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => performCationTest("NaOH", "Blue precipitate")}
                        >
                          Add NaOH (for Cu²⁺)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => performCationTest("NaOH", "White precipitate")}
                        >
                          Add NaOH (for Zn²⁺)
                        </Button>
                      </div>

                      <select
                        className="w-full p-2 rounded border"
                        value={selectedCation}
                        onChange={(e) => setSelectedCation(e.target.value)}
                      >
                        <option value="">Select Detected Cation</option>
                        {CATIONS.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Anion Tests */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Anion Tests</h3>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => performAnionTest("AgNO₃", "White precipitate")}
                        >
                          Add AgNO₃ (for Cl⁻)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => performAnionTest("BaCl₂", "White precipitate")}
                        >
                          Add BaCl₂ (for SO₄²⁻)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => performAnionTest("Dilute acid", "Effervescence")}
                        >
                          Add Dilute Acid (for CO₃²⁻)
                        </Button>
                      </div>

                      <select
                        className="w-full p-2 rounded border"
                        value={selectedAnion}
                        onChange={(e) => setSelectedAnion(e.target.value)}
                      >
                        <option value="">Select Detected Anion</option>
                        {ANIONS.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Complete Stage */}
                {stage === "complete" && (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <h3 className="font-semibold text-green-600 mb-2">Experiment Complete!</h3>
                    <p className="text-sm">
                      Cation: {CATIONS.find(c => c.id === selectedCation)?.name}<br />
                      Anion: {ANIONS.find(a => a.id === selectedAnion)?.name}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Right Panel - Observations */}
          <Card className="glass-effect p-6 space-y-6 lg:col-span-1">
            <h2 className="text-xl font-semibold">Observations</h2>

            <div className="space-y-4">
              {/* Test Results Summary */}
              {phResult && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="text-sm text-muted-foreground">pH Test</div>
                  <div className="font-semibold">{phResult}</div>
                </div>
              )}

              {flameTestDone && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="text-sm text-muted-foreground">Flame Test</div>
                  <div className="font-semibold">{flameColor}</div>
                </div>
              )}

              {cationTests.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="text-sm text-muted-foreground mb-2">Cation Tests</div>
                  {cationTests.map((test, idx) => (
                    <div key={idx} className="text-xs mb-1">
                      {test.test}: {test.result}
                    </div>
                  ))}
                </div>
              )}

              {anionTests.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="text-sm text-muted-foreground mb-2">Anion Tests</div>
                  {anionTests.map((test, idx) => (
                    <div key={idx} className="text-xs mb-1">
                      {test.test}: {test.result}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Observations Log */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Observation Log</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {observations.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No observations yet</p>
                ) : (
                  observations.map((obs, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/30 text-sm">
                      {obs}
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
