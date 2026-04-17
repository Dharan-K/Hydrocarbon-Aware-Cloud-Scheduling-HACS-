# 🌍 HydraSched: Hydrocarbon Aware Cloud Scheduling

> Balancing carbon efficiency with water sustainability in cloud computing.

HydraSched is a simulation-based cloud scheduler prototype designed to intelligently assign cloud computing workloads to global datacenter regions by optimizing for the lowest combined carbon footprint and water consumption, without violating latency and capacity constraints.

---

## 🚨 The Problem

Modern cloud computing is resource-intensive. While much of the focus has been on reducing carbon emissions (Energy Usage & Carbon Intensity), **water consumption** used for cooling datacenters is an often-overlooked environmental crisis. 

Traditional workload schedulers optimize purely for latency, cost, or availability. They fail to consider the holistic environmental impact of executing a job in a specific geographical region at a specific time.

## 💡 Our Solution

HydraSched introduces a dynamic **Hydrocarbon Scoring Engine**. Instead of routing jobs to the closest available server, our scheduler evaluates real-time environmental metrics to find the most sustainable region.

It calculates a precise environmental cost based on:
1. **Carbon Cost:** Local grid carbon intensity (gCO2/kWh).
2. **Water Cost:** Water Usage Effectiveness (WUE), Power Usage Effectiveness (PUE), Energy Water Intensity Factors (EWIF), and local Water Scarcity Factors (WSF).

By assigning custom weights (α and β) to these factors, users can establish routing policies that prioritize carbon reduction, water conservation, or a balanced approach.

---

## ✨ Features

- **Policy-Driven Routing:** Instantly switch between *Carbon Priority*, *Water Priority*, or *Balanced* scheduling modes.
- **Strict Constraint Filtering:** Ensures workloads are never assigned to regions that violate maximum latency limits or lack sufficient compute capacity.
- **Live Environmental Metrics:** Mocks real-world regional metrics including Carbon Intensity and WUE.
- **Interactive Dashboard:** A sleek, dark-mode React interface to simulate job assignments and visualize environmental savings.
- **Baseline Comparison:** Automatically compares the optimized scheduling decision against a traditional "lowest-latency" baseline scheduler, highlighting exact units of carbon and water saved.

---

## 🏗️ System Architecture

The project is structured as a clean 3-tier architecture:

1. **Frontend (UI Layer):** 
   - A modern React application serving as the simulation command center.
   - Handles parameter inputs, policy preset toggles, and dynamically charts the comparison results.
2. **Backend (API Layer):**
   - A fast, lightweight Python (Flask) server exposing endpoints for region data and job scheduling.
   - Manages the static environmental datasets and processes incoming simulation requests.
3. **Scoring Engine (Optimizer):**
   - The core mathematical engine located in the backend.
   - Filters regions by constraints (latency, capacity).
   - Computes strict `carbon_cost` and `water_cost` equations.
   - Selects the region with the lowest combined final score.

### 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend:** Python 3, Flask, Flask-CORS
- **Data:** Static JSON (Mocked Regional Telemetry)

---

## ⚙️ How it Works (Step-by-Step)

1. **Job Submission:** A user submits a workload defining energy requirements (kWh), a strict latency limit (ms), and required capacity.
2. **Constraint Filtering:** The backend instantly filters out any global regions that cannot meet the latency or capacity constraints.
3. **Cost Evaluation:** For the remaining viable regions, the engine calculates:
   - `Carbon Cost = Energy * Carbon Intensity`
   - `Water Cost = Energy * (WUE + PUE * EWIF) * (1 + WSF)`
4. **Scoring & Selection:** Costs are multiplied by the user's α (Carbon) and β (Water) weights. The region with the lowest aggregate score is selected.
5. **Visualization:** The frontend renders a breakdown of the winning region, the baseline region (naive selection), and charts the percentage of resources saved.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- Python (3.9+)

### 1. Start the Backend
```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python app.py
```
*The Flask API will start on `http://127.0.0.1:5000`*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
*The React app will start on `http://localhost:5173`*

---

## 📡 Example API Response

**`POST /api/schedule`**
```json
{
  "selected_region": {
    "name": "Ireland",
    "region_id": "europe-west-1",
    "carbon_cost": 40000,
    "water_cost": 341.25,
    "final_score": 20170.62,
    "latency_ms": 120
  },
  "baseline_region": {
    "name": "Virginia",
    "region_id": "us-east-1",
    "latency_ms": 15
  },
  "savings": {
    "carbon_saved": 110000,
    "water_saved": 393.0
  },
  "reason": "Selected Ireland with the lowest environmental score of 20170.62. Compared to the baseline standard lowest-latency routing (Virginia), this placement saves 110000 units of carbon cost and 393.0 units of water cost."
}
```

---

## 🎥 Demo Explanation

During a presentation or hackathon demo, try the following flow:
1. **The Constraints:** Show how setting a tight latency limit (e.g., `20ms`) forces the scheduler to pick a closer, potentially "dirtier" region like Virginia.
2. **The Presets:** Loosen the latency, then click between the **Carbon Priority** and **Water Priority** presets. Watch how the selected region dynamically changes (e.g., from Ireland to Oregon) depending on the active policy.
3. **The Impact:** Highlight the large green and blue Impact widgets, demonstrating that intelligent routing can save upwards of 70% in environmental costs compared to a standard scheduler without degrading performance requirements.
