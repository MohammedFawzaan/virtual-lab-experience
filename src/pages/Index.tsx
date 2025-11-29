import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BeakerIcon, FlaskConical, Microscope, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
const Index = () => {
  const [isHoveringCTA, setIsHoveringCTA] = useState(false);
  return <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent" />
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                  <Microscope className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Experience-Based Learning Platform</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Transform Lab Learning with{" "}
                  <span className="text-gradient">Virtual Hands-On</span>{" "}
                  Experience
                </h1>
                
                <p className="text-lg text-muted-foreground leading-relaxed">Break free from equipment limitations. Our interactive platform lets students perform real experiments, adjust parameters, record observations, and build genuine laboratory skills—anytime, anywhere.</p>

                <div className="flex flex-wrap gap-4">
                  <Link to="/lab">
                    <Button size="lg" className="group bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300" onMouseEnter={() => setIsHoveringCTA(true)} onMouseLeave={() => setIsHoveringCTA(false)}>
                      <Play className="w-5 h-5 mr-2" />
                      Start Your First Experiment
                      <ArrowRight className={`w-5 h-5 ml-2 transition-transform ${isHoveringCTA ? "translate-x-1" : ""}`} />
                    </Button>
                  </Link>
                  
                  <Button size="lg" variant="outline" className="border-2 hover:bg-muted/50">
                    Watch Demo
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex gap-8 pt-4">
                  <div>
                    <div className="text-3xl font-bold text-primary border-black">15+</div>
                    <div className="text-sm text-muted-foreground">Experiments</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-secondary">100%</div>
                    <div className="text-sm text-muted-foreground">Hands-On</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-accent">24/7</div>
                    <div className="text-sm text-muted-foreground">Access</div>
                  </div>
                </div>
              </div>

              {/* Right Visual */}
              <div className="relative">
                <div className="glass-effect rounded-3xl p-8 animate-float">
                  <div className="space-y-6">
                    {/* Virtual Lab Equipment Preview */}
                    <div className="flex justify-center gap-6">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                        <div className="relative bg-card rounded-2xl p-6 border-2 border-primary/20 hover:border-primary/40 transition-all">
                          <BeakerIcon className="w-16 h-16 text-primary mx-auto" />
                          <div className="mt-4 text-center">
                            <div className="text-sm font-semibold">Titration</div>
                            <div className="text-xs text-muted-foreground">Interactive</div>
                          </div>
                        </div>
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                        <div className="relative bg-card rounded-2xl p-6 border-2 border-secondary/20 hover:border-secondary/40 transition-all">
                          <FlaskConical className="w-16 h-16 text-secondary mx-auto" />
                          <div className="mt-4 text-center">
                            <div className="text-sm font-semibold">Reactions</div>
                            <div className="text-xs text-muted-foreground">Real-Time</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Simulated Data Display */}
                    <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Volume Added</span>
                        <span className="text-sm font-mono font-bold text-primary">24.8 mL</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">pH Level</span>
                        <span className="text-sm font-mono font-bold text-secondary">7.2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Color Change</span>
                        <div className="flex gap-2">
                          <div className="w-4 h-4 rounded-full bg-red-500" />
                          <span className="text-sm font-serif">{'->'}</span>
                          <div className="w-4 h-4 rounded-full bg-accent" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">The Challenge</h2>
              <p className="text-xl text-muted-foreground">
                Limited equipment shouldn't limit learning potential
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-effect rounded-xl p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">🔬</span>
                </div>
                <h3 className="text-xl font-semibold">Equipment Shortage</h3>
                <p className="text-muted-foreground">
                  Limited burettes, pipettes, and reagents turn experiments into observations
                </p>
              </div>

              <div className="glass-effect rounded-xl p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-xl font-semibold">Passive Learning</h3>
                <p className="text-muted-foreground">
                  Students watch instead of perform, missing crucial hands-on experience
                </p>
              </div>

              <div className="glass-effect rounded-xl p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold">Confidence Gap</h3>
                <p className="text-muted-foreground">
                  Without practice and mistakes, students lack real laboratory confidence
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                True <span className="text-gradient">Experimental Experience</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Not just simulations—genuine laboratory skills through interactive practice
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="group glass-effect rounded-2xl p-8 hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BeakerIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Interactive Equipment</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Adjust volumes, calibrate instruments, and control every parameter just like in a physical lab. 
                  Real-time feedback helps you understand cause and effect.
                </p>
              </div>

              <div className="group glass-effect rounded-2xl p-8 hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FlaskConical className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Visual Chemistry</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Watch color changes, observe reaction endpoints, and see pH shifts in real-time. 
                  Visual learning reinforces chemical concepts.
                </p>
              </div>

              <div className="group glass-effect rounded-2xl p-8 hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-2xl font-semibold mb-3">Data Recording</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Record your own observations, track measurements, and analyze results. 
                  Build scientific documentation skills through practice.
                </p>
              </div>

              <div className="group glass-effect rounded-2xl p-8 hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Microscope className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Unlimited Practice</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Repeat experiments as many times as needed. Make mistakes, learn from them, 
                  and build confidence through repetition—at your own pace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Experience Lab Work<br />
              <span className="text-gradient">Without Limitations?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start with our interactive titration experiment and discover true hands-on learning.
            </p>
            <Link to="/lab">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all text-lg px-8 py-6">
                <Play className="w-6 h-6 mr-2" />
                Begin Your First Experiment
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>;
};
export default Index;