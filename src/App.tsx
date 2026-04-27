import React, { useState, useMemo } from 'react';
import { LatticePillowScene } from './components/LatticePillow';
import { FormulaDisplay } from './components/FormulaDisplay';
import { MATERIALS, SimulationState, ForceType, MECHANICAL_FACTORS } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Info, ShieldCheck, Activity, ChevronRight, Calculator, ExternalLink } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<SimulationState>({
    material: MATERIALS[0],
    selectedForce: ForceType.COMPRESSION,
    forceValue: MECHANICAL_FACTORS[0].defaultValue,
    porosity: 0.4,
    dimensions: {
      length: 600,
      width: 400,
      thickness: 80,
    }
  });

  const results = useMemo(() => {
    const { material, selectedForce, forceValue, porosity, dimensions } = state;
    const { length, width, thickness } = dimensions;
    
    // Effective area and inertia based on lattice porosity
    const area = width * length * (1 - porosity);
    const ieff = (width * Math.pow(thickness, 3) / 12) * Math.pow(1 - porosity, 1.5);
    
    let stress = 0;
    let deflection = 0;
    
    switch (selectedForce) {
      case ForceType.COMPRESSION:
        stress = forceValue / area;
        deflection = (forceValue * thickness) / (material.e * area);
        break;
      case ForceType.TENSION:
        stress = forceValue / area;
        deflection = (forceValue * thickness) / (material.e * area);
        break;
      case ForceType.BENDING:
        const moment = forceValue * (length / 2);
        stress = (moment * (thickness / 2)) / ieff;
        deflection = (forceValue * Math.pow(length, 3)) / (48 * material.e * ieff);
        break;
      case ForceType.TORSION:
        const torque = forceValue * (width / 4);
        stress = (torque * (thickness / 2)) / (ieff * 0.8); // Simplified torsion
        deflection = (torque * length) / (material.e * 0.4 * ieff);
        break;
      case ForceType.IMPACT:
        const velocity = 5; // m/s
        const dt = 0.05; // s
        const impactForce = (forceValue * velocity) / dt;
        stress = impactForce / area;
        deflection = (impactForce * thickness) / (material.e * area);
        break;
      case ForceType.SHEAR:
        stress = forceValue / area;
        deflection = (forceValue * thickness) / (material.e * 0.6 * area);
        break;
    }

    const sf = isFinite(material.sigma / stress) ? material.sigma / stress : 999;

    return { stress, deflection, sf };
  }, [state]);

  const updateState = (updates: Partial<SimulationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const currentFactor = MECHANICAL_FACTORS.find(f => f.type === state.selectedForce)!;

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              AERODYNA <span className="text-blue-600 font-bold text-sm tracking-widest px-2 py-0.5 bg-blue-50 rounded border border-blue-100">PRO</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">Lattice Mechanics Simulation Lab v2.0</p>
          </div>
        </div>
        <div className="hidden md:flex gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Materials Database</a>
          <a href="#" className="hover:text-blue-600 transition-colors">FEA Parameters</a>
        </div>
      </nav>

      <main className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-10 gap-6 lg:h-[calc(100vh-80px)]">
        
        {/* Left Column: Mechanical Factors (20%) */}
        <aside className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">力的類型 (6 factors)</h2>
            <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">6</span>
          </div>
          
          <div className="space-y-2">
            {MECHANICAL_FACTORS.map((factor) => {
               const Icon = factor.icon;
               return (
                <button
                  key={factor.type}
                  onClick={() => updateState({ selectedForce: factor.type, forceValue: factor.defaultValue })}
                  className={`w-full text-left p-3 rounded-xl border transition-all group ${
                    state.selectedForce === factor.type 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/10' 
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                      state.selectedForce === factor.type ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex justify-between items-center">
                        <h3 className={`text-sm font-bold ${state.selectedForce === factor.type ? 'text-blue-900' : 'text-slate-700'}`}>
                          {factor.type}
                        </h3>
                        <ChevronRight size={14} className={state.selectedForce === factor.type ? 'text-blue-400' : 'text-slate-300'} />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{factor.description}</p>
                    </div>
                  </div>
                </button>
               );
            })}
          </div>
        </aside>

        {/* Center Column: 3D Visualization (50%) */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group min-h-[500px]">
          {/* 3D Overlays */}
          <div className="absolute top-4 left-4 z-10 space-y-2">
            <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-2 rounded-lg text-[10px] font-mono shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE SIMULATION
              </div>
            </div>
          </div>

          <div className="absolute top-4 right-4 z-10 text-right space-y-2">
            <div className="bg-slate-900/10 backdrop-blur shadow-inner p-3 rounded-xl text-slate-700 font-mono text-[10px]">
              <div className="text-slate-500 uppercase tracking-widest text-[8px] font-black">Simulation Data</div>
              <div>HOTSPOT MAX: <span className="text-orange-600 font-bold">{(results.stress * 1.5).toFixed(2)} MPa</span></div>
              <div className="mt-1 text-slate-500">F = {state.forceValue} {currentFactor.unit}</div>
            </div>
          </div>

          <div className="w-full h-full min-h-[500px] bg-slate-50">
            <LatticePillowScene state={state} results={results} />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-4 shadow-xl w-[90%] md:w-[80%] flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">實時參數連動</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase">{currentFactor.variableLabel}</label>
                  <span className="text-[10px] font-mono font-bold text-orange-500 bg-orange-50 px-1.5 rounded">{state.forceValue} {currentFactor.unit}</span>
                </div>
                <input 
                  type="range" min={currentFactor.min} max={currentFactor.max} step={10}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  value={state.forceValue}
                  onChange={(e) => updateState({ forceValue: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase">簍空孔隙率 (Porosity)</label>
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 rounded">{(state.porosity * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" min="0.1" max="0.8" step="0.05"
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  value={state.porosity}
                  onChange={(e) => updateState({ porosity: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Analytics & Insight (30%) */}
        <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-y-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Calculator className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">{state.selectedForce} 分析結果</h2>
              <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">Design Insight & SLA</p>
            </div>
          </div>

          <FormulaDisplay state={state} results={results} />

          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-widest">
              <Info className="w-4 h-4 text-blue-600" /> 專業評估指標
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">結構位移量 δ</span>
                <span className={`font-mono font-bold ${results.deflection < 15 ? 'text-emerald-600' : 'text-orange-500'}`}>
                  {results.deflection.toFixed(2)} mm
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">安全係數 SF</span>
                <span className={`font-mono font-bold ${results.sf > 2 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {results.sf > 100 ? '> 100' : results.sf.toFixed(2)} {results.sf > 2 ? '✓ 安全' : '✗ 危險'}
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                <div className="h-full bg-emerald-500" style={{ width: '40%' }} />
                <div className="h-full bg-emerald-300" style={{ width: '30%' }} />
                <div className="h-full bg-amber-400" style={{ width: '20%' }} />
                <div className="h-full bg-rose-500" style={{ width: '10%' }} />
              </div>
              <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                <span>人體舒適區</span>
                <span>臨界區</span>
                <span>結構破壞區</span>
              </div>
            </div>

            <div className={`rounded-xl p-4 space-y-2 shadow-lg transition-all duration-300 ${results.sf > 2 ? 'bg-slate-900 border-transparent' : 'bg-red-600 border-red-400 ring-2 ring-red-500/50'} border`}>
              <h4 className={`text-[10px] font-black uppercase tracking-widest ${results.sf > 2 ? 'text-slate-400' : 'text-red-100'}`}>系統診斷建議</h4>
              <div className="flex items-end gap-2">
                <span className={`text-2xl font-black font-mono ${results.sf > 2 ? 'text-blue-400' : 'text-white'}`}>{(state.porosity * 150).toFixed(1)}</span>
                <span className={`text-[10px] mb-1 opacity-60 ${results.sf > 2 ? 'text-white' : 'text-red-50'}`}>CFM (透氣潛力)</span>
              </div>
              <p className={`text-[10px] leading-relaxed italic border-t pt-2 text-left ${results.sf > 2 ? 'text-slate-300 border-slate-800' : 'text-white border-red-400 font-bold'}`}>
                {results.sf > 2 
                  ? "結構穩定，建議保持當前孔隙率以維持最佳熱流循環。" 
                  : "警告：受力過大或孔隙率過高，建議增加厚度或選用 TPE-95A 材質。"}
              </p>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="p-4 px-6 text-center border-t border-slate-200 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
            AERODYNA LABS © 2026 // INDUSTRIAL DESIGN MECHANICS
          </p>
          <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-left">
             產出 app (網址: {window.location.host}) <ExternalLink size={10} />
          </div>
        </div>
      </footer>
    </div>
  );
}
