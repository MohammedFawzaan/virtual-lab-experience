<!DOCTYPE html>
<html lang="en">
<head>
</head>
<body>
<p align="center"><img src="/public/logo.jpg" alt="icon" height=120/></p>
<h1 align="center"> Virtual Chemistry Lab </h1>
<p>
  This is the <strong>frontend</strong> of the Virtual Chemistry Lab — a fully interactive, modern web application built using <strong>React + Vite + Tailwind + ShadCN UI</strong>. Students can perform chemistry experiments such as distillation, titration, salt-analysis virtually, while faculty/admin can create experiments and view their student insights.
</p>

<hr />

<h2>🔗 Live Demo - Deployed on Vercel</h2>
<p>
  <a href="https://virtual-lab-experience.vercel.app" target="_blank">
    👉 Click here to view the live app
  </a>
</p>

<hr />

<h2>✨ Features</h2>
<ul>
  <li>Chemistry experiments included such as distillation, titration, salt-analysis</li>
  <li>Beautiful and responsive UI</li>
  <li>Role-based navigation (Student / Admin)</li>
  <li>Google login using JWT and passport.js</li>
  <li>Live experiment simulations</li>
  <li>Dashboard for data insights</li>
  <li>Reusable UI components (ShadCN)</li>
  <li>Protected frontend routes</li>
</ul>

<hr />

<h2>📁 Project Structure</h2>
<pre>
src/
├── components/        # Reusable UI Components
├── pages/             # Page-level components
├── hooks/             # Custom React Hooks
├── context/           # Global state providers
├── lib/               # API handlers & utilities
└── main.jsx           # App entrypoint
</pre>

<hr />

<h2>🛠️ Tech Stack</h2>
<ul>
  <li><strong>React</strong> – UI framework</li>
  <li><strong>Vite</strong> – Lightning-fast bundler</li>
  <li><strong>Tailwind CSS</strong> – Utility-first styling</li>
  <li><strong>ShadCN UI</strong> – Modern component library</li>
  <li><strong>Axios</strong> – API requests</li>
  <li><strong>React Router</strong> – Navigation</li>
</ul>

<hr />

<h2>🚀 Getting Started</h2>
<h3>1️⃣ Clone the repository</h3>
<pre>
git clone https://https://github.com/MohammedFawzaan/Virtual-Chemistry-Laboratory.git
</pre>

<h3>2️⃣ Install dependencies</h3>
<pre>
npm install
</pre>

<h3>3️⃣ Create a <code>.env</code> file</h3>
<pre>
VITE_BACKEND_URL=http://localhost:5000
</pre>

<h3>4️⃣ Start development server</h3>
<pre>
npm run dev
</pre>

<hr />

<h2>📦 Build for Production</h2>
<pre>
npm run build
</pre>

<hr />

<p align="center">Backend powering the Virtual Chemistry Laboratory platform - <a href="https://github.com/MohammedFawzaan/Backend-Service-For-LabXpert" target="_blank">Backend Repo.</a></p>

<hr />

<h2>📜 License</h2>
<p>By Mohammed Fawzaan.</p>

</body>
</html>
