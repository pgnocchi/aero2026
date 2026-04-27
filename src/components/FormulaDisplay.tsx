import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { SimulationState, MECHANICAL_FACTORS, ForceType } from '../types';

interface FormulaDisplayProps {
  state: SimulationState;
  results: {
    stress: number;
    deflection: number;
    sf: number;
  };
}

export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({ state, results }) => {
  const currentFactor = MECHANICAL_FACTORS.find(f => f.type === state.selectedForce)!;
  const { length, width, thickness } = state.dimensions;
  const area = width * length * (1 - state.porosity);

  return (
    <div className="space-y-6">
      {/* Primary Formula */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-inner">
        <div className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-2 opacity-60">Core Mechanic Equation</div>
        <div className="text-white overflow-x-auto py-2">
          <BlockMath math={currentFactor.formula} />
        </div>
      </div>

      {/* Numerical Parameters */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
             <span className="bg-emerald-100 text-emerald-600 px-1 rounded text-[8px] font-black font-mono">F</span>
             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">垂直作用力</span>
          </div>
          <div className="text-sm font-black text-slate-700 font-mono">{state.forceValue} <span className="text-[10px] font-medium text-slate-400 tracking-normal">[N]</span></div>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
             <span className="bg-blue-100 text-blue-600 px-1 rounded text-[8px] font-black font-mono">A</span>
             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">有效截面積</span>
          </div>
          <div className="text-sm font-black text-slate-700 font-mono">{(area / 1000000).toFixed(6)} <span className="text-[10px] font-medium text-slate-400 tracking-normal">[m²]</span></div>
        </div>
      </div>

      {/* Step by Step Calculation */}
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 space-y-4">
        <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
          <span className="w-1 h-1 bg-emerald-500 rounded-full" /> 計算過程 (Step-by-Step)
        </h4>
        <ol className="space-y-3 text-[11px] text-slate-600 font-medium">
          <li className="flex gap-3">
            <span className="text-emerald-500 font-black">1.</span>
            <span>確定作用力 <b>F: {state.forceValue} N</b></span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-500 font-black">2.</span>
            <span>計算簍空後有效面積 <b>A: {(area/1000000).toFixed(6)} m²</b></span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-500 font-black">3.</span>
            <span>代入公式: <b>{state.forceValue} / {(area/1000000).toFixed(6)}</b></span>
          </li>
        </ol>

        <div className="mt-4 pt-4 border-t border-emerald-100 flex justify-between items-center">
           <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">最終計算結果:</span>
           <span className="text-lg font-black font-mono text-blue-800">{results.stress.toLocaleString(undefined, { maximumFractionDigits: 0 })} Pa</span>
        </div>
      </div>
    </div>
  );
};
