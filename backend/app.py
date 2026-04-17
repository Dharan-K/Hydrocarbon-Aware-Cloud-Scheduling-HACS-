import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load regions data
DATA_FILE = os.path.join(os.path.dirname(__file__), 'regions.json')

def load_regions():
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

@app.route('/api/regions', methods=['GET'])
def get_regions():
    regions = load_regions()
    return jsonify(regions)

@app.route('/api/schedule', methods=['POST'])
def schedule_job():
    data = request.json
    if not data:
        return jsonify({"error": "No input data provided"}), 400
        
    energy_required = data.get("energy_required", 500)
    max_latency_ms = data.get("max_latency_ms", 100)
    required_capacity = data.get("required_capacity", 1)
    alpha = data.get("alpha", 0.5)
    beta = data.get("beta", 0.5)
    
    regions = load_regions()
    
    viable_regions = []
    comparisons = []
    
    # Baseline selection (lowest latency among those meeting capacity)
    baseline_region = None
    min_latency = float('inf')
    
    for r in regions:
        # Check capacity constraint for baseline
        if r['available_capacity'] >= required_capacity:
            if r['latency_to_user_ms'] < min_latency:
                min_latency = r['latency_to_user_ms']
                baseline_region = r
        
        # Constraint Filtering
        if r['latency_to_user_ms'] <= max_latency_ms and r['available_capacity'] >= required_capacity:
            viable_regions.append(r)
            
    if not viable_regions:
        return jsonify({"error": "No regions meet the constraints"}), 400
        
    if not baseline_region:
        baseline_region = viable_regions[0] # Fallback just in case
        
    best_region = None
    best_score = float('inf')
    
    for r in viable_regions:
        # Formulas
        carbon_cost = energy_required * r['carbon_intensity']
        # water_cost = energy * (WUE + PUE * EWIF) * (1 + WSF)
        water_cost = energy_required * (r['wue'] + r['pue'] * r['ewif']) * (1 + r['wsf'])
        final_score = alpha * carbon_cost + beta * water_cost
        
        comparison = {
            "region_id": r["region_id"],
            "name": r["name"],
            "carbon_cost": round(carbon_cost, 2),
            "water_cost": round(water_cost, 2),
            "final_score": round(final_score, 2),
            "latency_ms": r['latency_to_user_ms'],
            "available_capacity": r['available_capacity']
        }
        comparisons.append(comparison)
        
        if final_score < best_score:
            best_score = final_score
            best_region = comparison

    # Compute baseline costs to calculate savings
    baseline_carbon = energy_required * baseline_region['carbon_intensity']
    baseline_water = energy_required * (baseline_region['wue'] + baseline_region['pue'] * baseline_region['ewif']) * (1 + baseline_region['wsf'])
    
    savings = {
        "carbon_saved": round(baseline_carbon - best_region['carbon_cost'], 2),
        "water_saved": round(baseline_water - best_region['water_cost'], 2)
    }
    
    reason = f"Selected {best_region['name']} with the lowest environmental score of {best_region['final_score']}. "
    reason += f"Compared to the baseline standard lowest-latency routing ({baseline_region['name']}), this placement saves {savings['carbon_saved']} units of carbon cost and {savings['water_saved']} units of water cost."
    
    response = {
        "selected_region": best_region,
        "baseline_region": {
            "region_id": baseline_region["region_id"],
            "name": baseline_region["name"],
            "carbon_cost": round(baseline_carbon, 2),
            "water_cost": round(baseline_water, 2),
            "latency_ms": baseline_region["latency_to_user_ms"]
        },
        "comparisons": comparisons,
        "savings": savings,
        "reason": reason
    }
    
    return jsonify(response)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
