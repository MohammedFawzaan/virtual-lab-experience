import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, RotateCcw, TestTube } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

/**
 * Simple Salt Analysis simulation:
 * - Reagent slider (0 → 5 mL) simulates stepwise addition of reagent
 * - Preliminary test: pH indicator changes
 * - Flame test trigger at specific reagent volumes (simulated)
 * - Precipitation test when reagent volume crosses thresholds
 * - Detects and suggests likely cation/anion based on simple rules
 */

const SaltAnalysis = () => {
  const [reagent, setReagent] = useState(0); // mL
  const [pH, setPH] = useState(7.0);
  const [color, setColor] = useState("#f0f0f0");
  const [stage, setStage] = useState<"idle" | "preliminary" | "flame" | "precipitate">("idle");
  const [isComplete, setIsComplete] = useState(false);
  const [observations, setObservations] = useState<string[]>([]);
  const [inference, setInference] = useState<string | null>(null);

  useEffect(() => {
    // Simple logic to simulate changes with reagent addition
    if (reagent === 0) {
      setStage("idle");
      setPH(7.0);
      setColor("#f0f0f0");
      setInference(null);
      setIsComplete(false);
      return;
    }

    // preliminary (indicator) — small reagent additions
    if (reagent > 0 && reagent < 1.5) {
      setStage("preliminary");
      setPH(7 - reagent * 2); // slight acidity
      setColor("#ffefc2"); // light yellow (indicator change)
    } else if (reagent >= 1.5 && reagent < 3.0) {
      // flame test window (simulated)
      setStage("flame");
      setPH(6.0 - (reagent - 1.5) * 0.5);
      setColor("#ffd6e8");
    } else {
      // precipitation region
      setStage("precipitate");
      setPH(5.0 - (reagent - 3.0) * 0.5);
      setColor("#e6f7ff");
    }

    // simple inference heuristics
    if (reagent >= 3.5 && !isComplete) {
      // detect likely ions — toy logic for demo
      setIsComplete(true);
      const guessed = Math.random() > 0.5 ? "Chloride (Cl⁻) detected — white precipitate likely" : "Sulfate (SO₄²⁻) suspected — Ba²⁺ test suggested";
      setInference(guessed);
      addObservation(`Inference: ${guessed}`);
      toast.success("Analysis Suggestion Ready", { description: guessed });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reagent]);

  const addObservation = (obs: string) =>
    setObservations((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${obs}`]);

  const resetExperiment = () => {
    setReagent(0);
    setPH(7.0);
    setColor("#f0f0f0");
    setStage("idle");
    setIsComplete(false);
    setObservations([]);
    setInference(null);
    toast.info("Experiment Reset", { description: "Salt analysis cleared." });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/lab">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lab
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Salt Analysis — Virtual Lab</h1>
            <Button variant="outline" size="sm" onClick={resetExperiment}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Panel - Instructions */}
          <Card className="glass-effect p-6 space-y-6 lg:col-span-1">
            <div className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Salt Analysis (Simple)</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2 text-primary">Objective</h3>
                <p className="text-sm text-muted-foreground">
                  Perform preliminary & confirmatory style tests to suggest likely ions present.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 text-primary">Procedure</h3>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Add reagent slowly (use slider).</li>
                  <li>Watch pH / color indicator changes (preliminary).</li>
                  <li>Observe flame/precipitate simulation and note results.</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 text-primary">Safety Notes</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Add reagent dropwise in real labs — simulated here</li>
                  <li>• Use flame test only under supervision (simulated)</li>
                </ul>
              </div>
            </div>

            {isComplete && inference && (
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🔎</span>
                  <h3 className="font-semibold text-accent">Suggested Inference</h3>
                </div>
                <p className="text-sm text-muted-foreground">{inference}</p>
              </div>
            )}
          </Card>

          {/* Center Panel - Apparatus / Visual */}
          <Card className="glass-effect p-8 lg:col-span-1 flex flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Salt Analysis Setup</h2>
              <p className="text-sm text-muted-foreground">Add reagent, observe color and reactions</p>
            </div>

            {/* Visual test tube */}
            <div className="relative w-44 h-72 rounded-2xl border-4 border-primary/20 overflow-hidden shadow-2xl flex items-end justify-center">
              <div
                className="w-28 h-44 rounded-b-lg transition-all duration-500"
                style={{
                  background: `linear-gradient(to top, ${color}, #ffffff00)`,
                  boxShadow: reagent > 0 ? "0 10px 40px rgba(0,0,0,0.08)" : "none",
                }}
              />
            </div>

            {/* Reagent Control */}
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Reagent Added (mL)</span>
                <span className="text-2xl font-bold font-mono text-primary">{reagent.toFixed(2)} mL</span>
              </div>
              <Slider
                value={[reagent]}
                onValueChange={(v) => setReagent(Number(v[0].toFixed(2)))}
                min={0}
                max={5}
                step={0.01}
                className="w-full"
              />

              <div className="text-sm text-muted-foreground text-center">
                <div>Stage: <span className="font-semibold">{stage}</span></div>
                <div className="mt-1">pH: <span className="font-mono font-bold">{pH.toFixed(2)}</span></div>
              </div>
            </div>
          </Card>

          {/* Right Panel - Data & Observations */}
          <Card className="glass-effect p-6 space-y-6 lg:col-span-1">
            <h2 className="text-xl font-semibold">Measurements</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">pH (simulated)</div>
                <div className="text-3xl font-bold font-mono text-primary">{pH.toFixed(2)}</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Reagent Added</div>
                <div className="text-3xl font-bold font-mono text-secondary">{reagent.toFixed(2)} mL</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <div className="text-lg font-semibold">
                  {stage === "idle" && "Ready — add reagent"}
                  {stage === "preliminary" && "Preliminary changes observed"}
                  {stage === "flame" && "Flame test active (simulated)"}
                  {stage === "precipitate" && <span className="text-accent">Precipitation observed</span>}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Observations</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {observations.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No observations yet. Add reagent to begin tests.</p>
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
                  onClick={() => addObservation(`Reagent: ${reagent.toFixed(2)} mL, pH: ${pH.toFixed(2)}, Stage: ${stage}`)}
                >
                  Record Current State
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    if (isComplete && inference) {
                      addObservation(`Inference: ${inference}`);
                      toast.success("Inference Recorded");
                    } else {
                      toast("Add more reagent to get an analysis suggestion", { type: "info" } as any);
                    }
                  }}
                >
                  Save Inference
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SaltAnalysis;
