import { LucideIcon, Target, Activity, Wind, Layers, Move, RotateCcw, Zap, Scissors } from 'lucide-react';

export enum ForceType {
  COMPRESSION = 'Compression',
  TENSION = 'Tension',
  BENDING = 'Bending',
  TORSION = 'Torsion',
  IMPACT = 'Impact',
  SHEAR = 'Shear',
}

export interface MechanicalFactor {
  type: ForceType;
  icon: LucideIcon;
  formula: string;
  description: string;
  unit: string;
  variableName: string;
  variableLabel: string;
  defaultValue: number;
  min: number;
  max: number;
}

export interface Material {
  name: string;
  e: number; // Young's Modulus (MPa)
  sigma: number; // Yield Strength (MPa)
  color: string;
}

export interface SimulationState {
  material: Material;
  selectedForce: ForceType;
  forceValue: number; // F (N)
  porosity: number; // P (0-1)
  dimensions: {
    length: number; // L (mm)
    width: number; // b (mm)
    thickness: number; // h (mm)
  };
}

export const MATERIALS: Material[] = [
  { name: 'TPE-80A (High Flow)', e: 10, sigma: 2.5, color: '#3b82f6' },
  { name: 'TPE-95A (Rigid)', e: 25, sigma: 5.0, color: '#1d4ed8' },
  { name: 'Silicone Lattice', e: 5, sigma: 1.2, color: '#60a5fa' },
];

export const MECHANICAL_FACTORS: MechanicalFactor[] = [
  {
    type: ForceType.COMPRESSION,
    icon: Target,
    formula: '\\sigma = F / A',
    description: '物體受垂直表面力，導致體積縮小。',
    unit: 'N',
    variableName: 'forceValue',
    variableLabel: '施加壓力 (F)',
    defaultValue: 1000,
    min: 100,
    max: 5000,
  },
  {
    type: ForceType.TENSION,
    icon: Move,
    formula: 'T = F',
    description: '沿軸線方向向外拉伸。',
    unit: 'N',
    variableName: 'forceValue',
    variableLabel: '施加拉力 (F)',
    defaultValue: 500,
    min: 0,
    max: 2000,
  },
  {
    type: ForceType.BENDING,
    icon: Activity,
    formula: 'M = F \\cdot d',
    description: '導致物體彎曲的力矩。',
    unit: 'N',
    variableName: 'forceValue',
    variableLabel: '端點載重 (F)',
    defaultValue: 200,
    min: 0,
    max: 1000,
  },
  {
    type: ForceType.TORSION,
    icon: RotateCcw,
    formula: 'T = F \\cdot r',
    description: '導致物體繞軸旋轉的力矩。',
    unit: 'N',
    variableName: 'forceValue',
    variableLabel: '扭轉力 (F)',
    defaultValue: 150,
    min: 0,
    max: 800,
  },
  {
    type: ForceType.IMPACT,
    icon: Zap,
    formula: 'F \\approx mv / \\Delta t',
    description: '短時間施加的巨大作用力。',
    unit: 'kg',
    variableName: 'forceValue',
    variableLabel: '衝擊質量 (m)',
    defaultValue: 50,
    min: 1,
    max: 200,
  },
  {
    type: ForceType.SHEAR,
    icon: Scissors,
    formula: '\\tau = V / A',
    description: '沿平行表面方向錯動的力。',
    unit: 'N',
    variableName: 'forceValue',
    variableLabel: '剪切力 (V)',
    defaultValue: 1000,
    min: 0,
    max: 4000,
  },
];
