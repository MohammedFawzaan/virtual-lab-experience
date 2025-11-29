import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BeakerIcon, FlaskConical, TestTube2, ArrowLeft, Home } from "lucide-react";

export default function Lab() {
  const experiments = [
    {
      name: "Titration",
      path: "/lab/titration",
      icon: <BeakerIcon className="w-10 h-10 text-primary" />
    },
    {
      name: "Distillation",
      path: "/lab/distillation",
      icon: <FlaskConical className="w-10 h-10 text-secondary" />
    },
    {
      name: "Salt Analysis",
      path: "/lab/salt-analysis",
      icon: <TestTube2 className="w-10 h-10 text-accent" />
    }
  ];

  return (
    <div className="container mx-auto py-16 px-4">
      {/* Header Buttons */}
      <div className="flex items-center justify-between mb-10">
        <Link to="/home">
          <Button variant="outline" size="sm">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Link to="/lab">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lab
          </Button>
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-10 text-center">Choose an Experiment</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {experiments.map((exp) => (
          <Link key={exp.name} to={exp.path}>
            <Card className="p-6 hover:shadow-xl transition-all text-center cursor-pointer">
              <div className="flex justify-center mb-4">{exp.icon}</div>
              <h2 className="text-xl font-semibold">{exp.name}</h2>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
