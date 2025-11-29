// pages/admin/CreateExperiment.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import api from "@/api/client";
import { useNavigate } from "react-router-dom";

export default function CreateExperiment() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    type: "",
    videoUrl: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    await api.post("/api/experiments", form);
    navigate('/admin/dashboard');
  };

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Experiment</h1>

      <div className="grid gap-4">
        <input
          name="title"
          placeholder="Experiment Title"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <input
          name="subtitle"
          placeholder="Short Description"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <select
          name="type"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        >
          <option>Select Type</option>
          <option value="titration">Titration</option>
          <option value="distillation">Distillation</option>
          <option value="salt-analysis">Salt Analysis</option>
        </select>

        <input
          name="videoUrl"
          placeholder="Demo Video URL"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <Button onClick={handleSubmit}>Create</Button>
      </div>
    </div>
  );
}
