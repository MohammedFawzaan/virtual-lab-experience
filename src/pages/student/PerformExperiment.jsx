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

  if (!exp) return <p>Loading...</p>;

  return (
    <div>
      {exp.type === "titration" && <Titration experimentId={exp._id} experimentTitle={exp.title} />}
      {exp.type === "distillation" && <Distillation experimentId={exp._id} />}
      {exp.type === "salt-analysis" && <SaltAnalysis experimentId={exp._id} />}
    </div>
  );
}
