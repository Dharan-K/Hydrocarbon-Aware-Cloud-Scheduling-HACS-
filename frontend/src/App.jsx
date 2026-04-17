import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Leaf, Droplets, Zap, Activity, CheckCircle2, Clock, Scale } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

function App() {
  const [regions, setRegions] = useState([]);
  const [jobData, setJobData] = useState({
    energy_required: 500,
    max_latency_ms: 150,
    required_capacity: 100,
    alpha: 0.5,
    beta: 0.5
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/regions`);
      setRegions(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load regions. Is the backend running?');
    }
  };

  const handleSubmit = async (e) => {
    if(e) e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await axios.post(`${API_BASE}/schedule`, {
        ...jobData,
        energy_required: Number(jobData.energy_required),
        max_latency_ms: Number(jobData.max_latency_ms),
        required_capacity: Number(jobData.required_capacity),
        alpha: Number(jobData.alpha),
        beta: Number(jobData.beta),
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to schedule job.');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobData({ ...jobData, [name]: value });
  };

  const applyPreset = (alpha, beta) => {
    setJobData({ ...jobData, alpha, beta });
  };

  // Prepare chart data with weighted components
  const chartData = result?.comparisons.map(c => ({
    ...c,
    weighted_carbon: Number((c.carbon_cost * jobData.alpha).toFixed(2)),
    weighted_water: Number((c.water_cost * jobData.beta).toFixed(2))
  })) || [];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-sans selection:bg-emerald-500/30">
      <header className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-emerald-400">
          <Leaf className="w-8 h-8" />
          HACS Prototype
        </h1>
        <p className="text-gray-400 mt-2 text-lg">Balancing carbon efficiency with water sustainability in cloud scheduling</p>
      </header>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-3">
          <Zap className="text-red-400" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form & Regions */}
        <div className="lg:col-span-1 space-y-8">
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-5 text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400"/> Job Parameters
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Energy Required (kWh)</label>
                <input type="number" name="energy_required" value={jobData.energy_required} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none rounded-lg p-2.5 text-white transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Max Latency (ms)</label>
                  <input type="number" name="max_latency_ms" value={jobData.max_latency_ms} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none rounded-lg p-2.5 text-white transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Required Capacity</label>
                  <input type="number" name="required_capacity" value={jobData.required_capacity} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none rounded-lg p-2.5 text-white transition-all" />
                </div>
              </div>

              {/* Policy Presets */}
              <div className="pt-2">
                <label className="block text-sm text-gray-400 mb-3">Optimization Policy</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => applyPreset(0.8, 0.2)} className={`py-2 px-2 text-xs rounded-lg border transition-colors ${jobData.alpha === 0.8 && jobData.beta === 0.2 ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300' : 'bg-gray-950 border-gray-700 text-gray-400 hover:bg-gray-800'}`}>
                    Carbon Priority
                  </button>
                  <button type="button" onClick={() => applyPreset(0.2, 0.8)} className={`py-2 px-2 text-xs rounded-lg border transition-colors ${jobData.alpha === 0.2 && jobData.beta === 0.8 ? 'bg-blue-900/50 border-blue-500 text-blue-300' : 'bg-gray-950 border-gray-700 text-gray-400 hover:bg-gray-800'}`}>
                    Water Priority
                  </button>
                  <button type="button" onClick={() => applyPreset(0.5, 0.5)} className={`py-2 px-2 text-xs rounded-lg border transition-colors ${jobData.alpha === 0.5 && jobData.beta === 0.5 ? 'bg-purple-900/50 border-purple-500 text-purple-300' : 'bg-gray-950 border-gray-700 text-gray-400 hover:bg-gray-800'}`}>
                    Balanced
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2 flex justify-between">
                    <span>Carbon Weight (&alpha;)</span> <span className="text-emerald-400 font-mono">{jobData.alpha}</span>
                  </label>
                  <input type="range" name="alpha" min="0" max="1" step="0.1" value={jobData.alpha} onChange={handleInputChange} className="w-full accent-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2 flex justify-between">
                    <span>Water Weight (&beta;)</span> <span className="text-blue-400 font-mono">{jobData.beta}</span>
                  </label>
                  <input type="range" name="beta" min="0" max="1" step="0.1" value={jobData.beta} onChange={handleInputChange} className="w-full accent-blue-500" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full mt-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                {loading ? 'Evaluating...' : <><Zap className="w-5 h-5"/> Schedule Job</>}
              </button>
            </form>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400"/> Available Regions
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {regions.map(r => (
                <div key={r.region_id} className="bg-gray-950/50 border border-gray-800/80 p-4 rounded-xl text-sm hover:border-gray-700 transition-colors">
                  <div className="font-bold text-gray-200 flex justify-between items-center mb-3">
                    <span className="text-emerald-400 text-base">{r.name}</span> 
                    <span className="text-gray-500 font-mono text-xs bg-gray-900 px-2 py-1 rounded">{r.region_id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-gray-400">
                    <div className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-yellow-500"/> {r.carbon_intensity} gCO2/kWh</div>
                    <div className="flex items-center gap-2"><Droplets className="w-3.5 h-3.5 text-blue-500"/> WUE {r.wue}</div>
                    <div className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-purple-500"/> Cap {r.available_capacity}</div>
                    <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-orange-500"/> {r.latency_to_user_ms} ms</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Results & Analytics */}
        <div className="lg:col-span-2 space-y-8">
          {!result ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 h-full flex flex-col items-center justify-center text-gray-500 text-center shadow-xl">
              <Scale className="w-20 h-20 mb-6 opacity-20" />
              <h2 className="text-2xl font-semibold text-gray-300">Awaiting Job Parameters</h2>
              <p className="mt-3 max-w-md text-gray-400">Configure your workload constraints on the left and hit schedule to run the simulation across our datacenters.</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500 space-y-8">
              
              {/* Decision Comparison Highlight */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900 to-emerald-950/20 pointer-events-none" />
                <div className="relative z-10 p-4 border border-gray-700/50 rounded-lg bg-gray-950/50">
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Baseline Selection</p>
                  <p className="text-2xl font-bold text-gray-200">{result.baseline_region.name}</p>
                  <p className="text-sm text-gray-500 mt-1">Chosen for lowest latency ({result.baseline_region.latency_ms} ms)</p>
                </div>
                <div className="relative z-10 p-4 border-2 border-emerald-500/50 rounded-lg bg-emerald-950/30">
                  <p className="text-emerald-400 text-sm font-medium uppercase tracking-wider mb-2">Optimized Selection</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-2">
                    {result.selected_region.name} <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </p>
                  <p className="text-sm text-emerald-200/70 mt-1">Chosen for lowest environmental impact</p>
                </div>
              </div>

              {/* Analytics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-emerald-900/40 to-gray-900 border border-emerald-900/50 rounded-xl p-6 relative overflow-hidden shadow-xl">
                  <Leaf className="w-24 h-24 text-emerald-500/10 absolute -bottom-4 -right-4" />
                  <div className="relative z-10">
                    <p className="text-emerald-500/80 font-medium text-sm mb-2 uppercase tracking-wider">Carbon Impact</p>
                    <p className="text-4xl font-bold text-emerald-400 mb-2">{result.savings.carbon_saved.toLocaleString()} <span className="text-base font-normal text-emerald-600/80">units saved</span></p>
                    <div className="inline-block bg-emerald-950 text-emerald-300 border border-emerald-800/50 px-3 py-1 rounded-full text-sm font-medium">
                      Carbon reduced by {((result.savings.carbon_saved / result.baseline_region.carbon_cost) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-900/40 to-gray-900 border border-blue-900/50 rounded-xl p-6 relative overflow-hidden shadow-xl">
                  <Droplets className="w-24 h-24 text-blue-500/10 absolute -bottom-4 -right-4" />
                  <div className="relative z-10">
                    <p className="text-blue-500/80 font-medium text-sm mb-2 uppercase tracking-wider">Water Impact</p>
                    <p className="text-4xl font-bold text-blue-400 mb-2">{result.savings.water_saved.toLocaleString()} <span className="text-base font-normal text-blue-600/80">units saved</span></p>
                    <div className="inline-block bg-blue-950 text-blue-300 border border-blue-800/50 px-3 py-1 rounded-full text-sm font-medium">
                      Water reduced by {((result.savings.water_saved / result.baseline_region.water_cost) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Selection Reason */}
              <div className="bg-gray-900 border-l-4 border-l-emerald-500 border-y border-r border-gray-800 rounded-r-xl p-6 shadow-xl">
                <p className="text-gray-300 text-lg leading-relaxed italic text-center px-4">"{result.reason}"</p>
              </div>

              {/* Charts & Tables */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-6">Score Breakdown (Alpha/Beta Weighted)</h3>
                
                <div className="h-80 mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                      <XAxis dataKey="name" stroke="#6b7280" tick={{fill: '#9CA3AF'}} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" tick={{fill: '#9CA3AF'}} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '0.5rem' }} 
                        itemStyle={{ color: '#fff' }}
                        cursor={{fill: '#1f2937'}}
                        formatter={(value) => value.toLocaleString()}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="weighted_carbon" name="Carbon Component" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="weighted_water" name="Water Component" stackId="a" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-800">
                  <table className="w-full text-left text-sm text-gray-400">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-950">
                      <tr>
                        <th className="px-5 py-4 font-medium">Region</th>
                        <th className="px-5 py-4 font-medium">Latency</th>
                        <th className="px-5 py-4 font-medium">Carbon Cost</th>
                        <th className="px-5 py-4 font-medium">Water Cost</th>
                        <th className="px-5 py-4 font-medium text-right">Final Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50 bg-gray-900">
                      {result.comparisons.map(r => {
                        const isSelected = r.region_id === result.selected_region.region_id;
                        const isBaseline = r.region_id === result.baseline_region.region_id;
                        return (
                          <tr key={r.region_id} className={`transition-colors hover:bg-gray-800/50 ${isSelected ? 'bg-emerald-900/10' : ''}`}>
                            <td className="px-5 py-4 font-medium text-gray-200">
                              <div className="flex items-center gap-2">
                                {r.name}
                                {isSelected && <span className="text-[10px] bg-emerald-500 text-emerald-950 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider shadow-sm">Optimized</span>}
                                {isBaseline && !isSelected && <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Baseline</span>}
                              </div>
                            </td>
                            <td className="px-5 py-4">{r.latency_ms} ms</td>
                            <td className="px-5 py-4 text-emerald-400/80 font-mono">{r.carbon_cost.toLocaleString()}</td>
                            <td className="px-5 py-4 text-blue-400/80 font-mono">{r.water_cost.toLocaleString()}</td>
                            <td className={`px-5 py-4 text-right font-bold font-mono ${isSelected ? 'text-emerald-400 text-base' : 'text-white'}`}>
                              {r.final_score.toLocaleString()}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
