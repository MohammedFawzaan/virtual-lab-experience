import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/client";

import Titration from "../lab/titration";
import Distillation from "../lab/distillation";
import SaltAnalysis from "../lab/salt-analysis";

export default function PerformExperiment() {
  const { id } = useParams();
  const [exp, setExp] = useState(null);

  useEffect(() => {
    api.get(`/api/experiments/${id}`).then((res) => setExp(res.data));
  }, [id]);

  if (!exp)
    return <div className="flex items-center justify-center h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin" />
    </div>;

  return (
    <div>
      {exp.type === "titration" && <Titration experimentId={exp._id} experimentTitle={exp.title} />}
      {exp.type === "distillation" && <Distillation experimentId={exp._id} experimentTitle={exp.title} />}
      {exp.type === "salt-analysis" && <SaltAnalysis experimentId={exp._id} experimentTitle={exp.title} />}
    </div>
  );
}