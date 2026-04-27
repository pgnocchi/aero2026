import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SimulationState, ForceType } from '../types';

interface LatticePillowSceneProps {
  state: SimulationState;
  results: {
    stress: number;
    deflection: number;
    sf: number;
  };
}

export const LatticePillowScene: React.FC<LatticePillowSceneProps> = ({ state, results }) => {
  const { length, width, thickness } = state.dimensions;
  
  // Grid configuration
  const rows = 12;
  const cols = 20;
  
  // Calculate grid points with deformation
  const points = useMemo(() => {
    const pts = [];
    const defScale = results.deflection * 3.5; // Significantly exaggerated for visual impact
    
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        // Normalized coordinates (-1 to 1)
        const nx = (c / cols) * 2 - 1;
        const ny = (r / rows) * 2 - 1;
        
        let dx = 0;
        let dy = 0;
        let stressIntensity = 0;

        switch (state.selectedForce) {
          case ForceType.COMPRESSION:
            stressIntensity = Math.exp(-(nx * nx + ny * ny) * 2);
            dy = defScale * stressIntensity * (ny > 0 ? 1 : 0.2);
            break;
          case ForceType.TENSION:
            stressIntensity = Math.abs(nx);
            dx = defScale * nx * 0.8; // More horizontal stretch
            break;
          case ForceType.BENDING:
            stressIntensity = Math.cos((nx * Math.PI) / 2);
            dy = defScale * stressIntensity;
            break;
          case ForceType.TORSION:
            stressIntensity = Math.abs(nx * ny);
            dy = defScale * nx * ny * 0.8;
            dx = defScale * nx * ny * 0.4;
            break;
          case ForceType.IMPACT:
            const dist = Math.sqrt(nx * nx + ny * ny);
            stressIntensity = Math.exp(-dist * 3);
            dy = defScale * stressIntensity * 1.5; // Bigger impact
            break;
          case ForceType.SHEAR:
            stressIntensity = Math.abs(ny);
            dx = defScale * ny * 0.8;
            break;
        }

        pts.push({
          x: (c / cols) * 100 + dx,
          y: (r / rows) * 100 + dy,
          intensity: stressIntensity
        });
      }
    }
    return pts;
  }, [state.selectedForce, results.deflection, rows, cols]);

  // Generate SVG lines
  const lines = useMemo(() => {
    const horizontal = [];
    const vertical = [];

    // Horizontal lines
    for (let r = 0; r <= rows; r++) {
      let d = `M ${points[r * (cols + 1)].x} ${points[r * (cols + 1)].y}`;
      for (let c = 1; c <= cols; c++) {
        d += ` L ${points[r * (cols + 1) + c].x} ${points[r * (cols + 1) + c].y}`;
      }
      horizontal.push(d);
    }

    // Vertical lines
    for (let c = 0; c <= cols; c++) {
      let d = `M ${points[c].x} ${points[c].y}`;
      for (let r = 1; r <= rows; r++) {
        d += ` L ${points[r * (cols + 1) + c].x} ${points[r * (cols + 1) + c].y}`;
      }
      vertical.push(d);
    }

    return { horizontal, vertical };
  }, [points, rows, cols]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-50 relative overflow-hidden">
      {/* Background Grid Info */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      <div className="relative w-full max-w-4xl aspect-[2/1] bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-4 flex items-center justify-center overflow-hidden">
        <svg 
          viewBox="-10 -10 120 120" 
          className="w-full h-full drop-shadow-sm"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Definition for gradients */}
          <defs>
            <radialGradient id="stressGradient">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Pillow Shadow/Glow */}
          <rect x="0" y="0" width="100" height="100" rx="8" fill={state.material.color} fillOpacity="0.05" />

          {/* Lattice Grid */}
          <g className="transition-all duration-500 ease-out">
            {lines.horizontal.map((d, i) => (
              <motion.path
                key={`h-${i}`}
                initial={false}
                animate={{ d }}
                stroke={results.sf < 2 ? "#ef4444" : "#3b82f6"} // Dynamic color
                strokeWidth={results.sf < 2 ? "0.3" : "0.15"} // Thicker lines on warning
                fill="none"
                strokeOpacity={results.sf < 2 ? "0.6" : "0.3"}
              />
            ))}
            {lines.vertical.map((d, i) => (
              <motion.path
                key={`v-${i}`}
                initial={false}
                animate={{ d }}
                stroke={results.sf < 2 ? "#ef4444" : "#3b82f6"}
                strokeWidth={results.sf < 2 ? "0.3" : "0.15"}
                fill="none"
                strokeOpacity={results.sf < 2 ? "0.6" : "0.3"}
              />
            ))}
          </g>

          {/* Stress Heatmap Nodes */}
          {points.map((p, i) => (
            p.intensity > 0.4 && (
              <motion.circle
                key={`node-${i}`}
                initial={false}
                animate={{ cx: p.x, cy: p.y }}
                r={p.intensity * 1.5}
                fill="#f97316"
                fillOpacity={p.intensity * 0.3}
              />
            )
          ))}

          {/* Ergonomic Outline */}
          <rect 
            x="0" y="0" width="100" height="100" rx="8" 
            stroke={state.material.color} 
            strokeWidth="0.5" 
            fill="none" 
            strokeDasharray="2 2"
          />

          {/* Annotation lines */}
          <line x1="0" y1="110" x2="100" y2="110" stroke="#cbd5e1" strokeWidth="0.2" />
          <text x="50" y="115" fontSize="3" textAnchor="middle" fill="#94a3b8" className="font-mono font-bold">L = {length}mm</text>
        </svg>

        {/* Floating Force Vector Indicator */}
        <AnimatePresence>
          <motion.div 
            key={state.selectedForce}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-10 flex flex-col items-center gap-2"
          >
            <div className="w-0.5 h-12 bg-orange-500 animate-bounce" />
            <div className="bg-orange-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg">
              {state.forceValue}N APPLYING
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex gap-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Normal Stress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500/40 border border-orange-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Structural Hotspot</span>
        </div>
      </div>
    </div>
  );
};
