import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, RotateCcw, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Lab = () => {
  const [volume, setVolume] = useState(0);
  const [pH, setPH] = useState(1.2);
  const [color, setColor] = useState("#ff6b6b");
  const [isComplete, setIsComplete] = useState(false);
  const [observations, setObservations] = useState<string[]>([]);

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    
    // Simulate pH change during titration
    if (vol < 20) {
      setPH(1.2 + (vol * 0.15));
      setColor("#ff6b6b"); // Red
    } else if (vol < 25) {
      setPH(5.0 + ((vol - 20) * 0.4));
      setColor("#ff8b8b"); // Light red
    } else if (vol < 30) {
      setPH(7.0 + ((vol - 25) * 0.2));
      setColor("#ffd6e8"); // Pink (endpoint)
      if (!isComplete && vol >= 24.5 && vol <= 25.5) {
        setIsComplete(true);
        addObservation(`Endpoint reached at ${vol.toFixed(1)} mL - Color changed to pink!`);
        toast.success("Endpoint Detected!", {
          description: "Perfect! The solution has reached its equivalence point.",
        });
      }
    } else {
      setPH(8.0 + ((vol - 30) * 0.1));
      setColor("#ffa4d6"); // Bright pink
    }
  };

  const addObservation = (obs: string) => {
    setObservations(prev => [...prev, `${new Date().toLocaleTimeString()}: ${obs}`]);
  };

  const resetExperiment = () => {
    setVolume(0);
    setPH(1.2);
    setColor("#ff6b6b");
    setIsComplete(false);
    setObservations([]);
    toast.info("Experiment Reset", {
      description: "Ready to start a new titration!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Virtual Chemistry Lab</h1>
            <Button variant="outline" size="sm" onClick={resetExperiment}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      {/* Main Lab Interface */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Panel - Instructions */}
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
                  You've successfully identified the endpoint. Review your observations below.
                </p>
              </div>
            )}
          </Card>

          {/* Center Panel - Virtual Lab Equipment */}
          <Card className="glass-effect p-8 lg:col-span-1 flex flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Titration Setup</h2>
              <p className="text-sm text-muted-foreground">Use the controls below to perform the experiment</p>
            </div>

            {/* Burette Visualization */}
            <div className="relative w-32 h-80 bg-gradient-to-b from-muted/30 to-muted/10 rounded-3xl border-4 border-primary/30 overflow-hidden shadow-2xl">
              {/* Burette graduations */}
              <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none">
                {[0, 10, 20, 30, 40, 50].map((mark) => (
                  <div key={mark} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="w-2 h-px bg-primary/40" />
                    <span className="font-mono">{mark}</span>
                  </div>
                ))}
              </div>
              
              {/* Liquid level */}
              <div 
                className="absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out"
                style={{ 
                  height: `${(volume / 50) * 100}%`,
                  background: `linear-gradient(to bottom, ${color}dd, ${color})`
                }}
              />
            </div>

            {/* Beaker Visualization */}
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
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-primary/30"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-mono text-sm">{color}</span>
                </div>
              </div>
            </div>

            {/* Volume Control */}
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Volume Added (mL)</span>
                <span className="text-2xl font-bold font-mono text-primary">{volume.toFixed(1)}</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={50}
                step={0.1}
                className="w-full"
              />
            </div>
          </Card>

          {/* Right Panel - Data & Observations */}
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
                  <p className="text-sm text-muted-foreground italic">
                    No observations yet. Start adding the base solution!
                  </p>
                ) : (
                  observations.map((obs, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/30 text-sm">
                      {obs}
                    </div>
                  ))
                )}
              </div>
              
              {volume > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => addObservation(`Volume: ${volume.toFixed(1)} mL, pH: ${pH.toFixed(2)}, Color: ${color > "#ff8b8b" ? "Pink" : "Red"}`)}
                >
                  Record Current State
                </Button>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Lab;
