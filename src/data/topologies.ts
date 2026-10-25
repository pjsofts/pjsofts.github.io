// The pattern diagrams. Each is a handful of boxes and arrows on a 680x260
// canvas; <Topology> does the geometry. Kept as data so the landing page and the
// slides draw the same picture of the same pattern.

export type Tone = 'paper' | 'ink' | 'gold' | 'violet';

export interface TNode {
  id: string;
  x: number;
  y: number;
  label: string;
  sub?: string;
  tone?: Tone;
  w?: number;
}

export interface TEdge {
  from: string;
  to: string;
  /** Perpendicular bend, in canvas units. Positive bends to the left of travel. */
  curve?: number;
  dashed?: boolean;
  label?: string;
  /** No arrowheads: a line between peers. */
  plain?: boolean;
}

export interface Topology {
  nodes: TNode[];
  edges: TEdge[];
}

export const TOPOLOGIES: Record<string, Topology> = {
  chain: {
    nodes: [
      { id: 'in', x: 60, y: 130, label: 'input', w: 84 },
      { id: 'a', x: 200, y: 130, label: 'LLM', sub: 'outline', tone: 'ink' },
      { id: 'g', x: 340, y: 130, label: 'gate', sub: 'check', tone: 'gold', w: 90 },
      { id: 'b', x: 480, y: 130, label: 'LLM', sub: 'draft', tone: 'ink' },
      { id: 'out', x: 620, y: 130, label: 'output', w: 84 },
    ],
    edges: [
      { from: 'in', to: 'a' },
      { from: 'a', to: 'g' },
      { from: 'g', to: 'b', label: 'pass' },
      { from: 'b', to: 'out' },
      { from: 'g', to: 'a', curve: -70, dashed: true, label: 'fail: retry' },
    ],
  },

  route: {
    nodes: [
      { id: 'in', x: 70, y: 130, label: 'input', w: 90 },
      { id: 'r', x: 230, y: 130, label: 'router', sub: 'classify', tone: 'gold' },
      { id: 'a', x: 440, y: 45, label: 'refund prompt', tone: 'ink', w: 160 },
      { id: 'b', x: 440, y: 130, label: 'small model', tone: 'ink', w: 160 },
      { id: 'c', x: 440, y: 215, label: 'plain code', tone: 'violet', w: 160 },
      { id: 'out', x: 620, y: 130, label: 'output', w: 84 },
    ],
    edges: [
      { from: 'in', to: 'r' },
      { from: 'r', to: 'a' },
      { from: 'r', to: 'b' },
      { from: 'r', to: 'c' },
      { from: 'a', to: 'out' },
      { from: 'b', to: 'out' },
      { from: 'c', to: 'out' },
    ],
  },

  parallel: {
    nodes: [
      { id: 'in', x: 60, y: 130, label: 'input', w: 84 },
      { id: 'a', x: 260, y: 45, label: 'LLM', sub: 'section A', tone: 'ink' },
      { id: 'b', x: 260, y: 130, label: 'LLM', sub: 'section B', tone: 'ink' },
      { id: 'c', x: 260, y: 215, label: 'LLM', sub: 'section C', tone: 'ink' },
      { id: 'm', x: 460, y: 130, label: 'aggregate', sub: 'merge / vote', tone: 'gold', w: 130 },
      { id: 'out', x: 620, y: 130, label: 'output', w: 84 },
    ],
    edges: [
      { from: 'in', to: 'a' },
      { from: 'in', to: 'b' },
      { from: 'in', to: 'c' },
      { from: 'a', to: 'm' },
      { from: 'b', to: 'm' },
      { from: 'c', to: 'm' },
      { from: 'm', to: 'out' },
    ],
  },

  react: {
    nodes: [
      { id: 'goal', x: 70, y: 70, label: 'goal', w: 90 },
      { id: 't', x: 250, y: 70, label: 'think', tone: 'ink' },
      { id: 'a', x: 470, y: 70, label: 'act', sub: 'tool call', tone: 'gold' },
      { id: 'o', x: 470, y: 200, label: 'observe', sub: 'tool result', tone: 'violet' },
      { id: 'ans', x: 250, y: 200, label: 'answer', w: 100 },
    ],
    edges: [
      { from: 'goal', to: 't' },
      { from: 't', to: 'a' },
      { from: 'a', to: 'o' },
      { from: 'o', to: 't', curve: -30 },
      { from: 't', to: 'ans', dashed: true, label: 'done' },
    ],
  },

  plan: {
    nodes: [
      { id: 'goal', x: 60, y: 70, label: 'goal', w: 84 },
      { id: 'p', x: 200, y: 70, label: 'planner', tone: 'gold', w: 110 },
      { id: 's1', x: 350, y: 70, label: 'step 1', tone: 'ink', w: 96 },
      { id: 's2', x: 480, y: 70, label: 'step 2', tone: 'ink', w: 96 },
      { id: 's3', x: 610, y: 70, label: 'step 3', tone: 'ink', w: 96 },
      { id: 'ans', x: 610, y: 205, label: 'answer', w: 96 },
    ],
    edges: [
      { from: 'goal', to: 'p' },
      { from: 'p', to: 's1' },
      { from: 's1', to: 's2' },
      { from: 's2', to: 's3' },
      { from: 's3', to: 'ans' },
      { from: 's2', to: 'p', curve: -95, dashed: true, label: 'failed: replan' },
    ],
  },

  reflect: {
    nodes: [
      { id: 'in', x: 70, y: 100, label: 'task', w: 90 },
      { id: 'g', x: 250, y: 100, label: 'generate', tone: 'ink', w: 120 },
      { id: 'c', x: 450, y: 100, label: 'critique', sub: 'tests / rubric', tone: 'gold', w: 140 },
      { id: 'out', x: 615, y: 100, label: 'output', w: 90 },
      { id: 'm', x: 450, y: 215, label: 'lesson', sub: 'written down', tone: 'violet', w: 130 },
    ],
    edges: [
      { from: 'in', to: 'g' },
      { from: 'g', to: 'c' },
      { from: 'c', to: 'out', label: 'pass' },
      { from: 'c', to: 'm', dashed: true },
      { from: 'm', to: 'g', dashed: true, label: 'next try' },
    ],
  },

  codeact: {
    nodes: [
      { id: 'ag', x: 110, y: 130, label: 'agent', tone: 'ink', w: 110 },
      { id: 'code', x: 340, y: 50, label: 'code action', sub: 'python', tone: 'violet', w: 150 },
      { id: 'sb', x: 560, y: 130, label: 'sandbox', sub: 'no network', tone: 'gold', w: 130 },
      { id: 'res', x: 340, y: 210, label: 'stdout / error', w: 150 },
    ],
    edges: [
      { from: 'ag', to: 'code' },
      { from: 'code', to: 'sb' },
      { from: 'sb', to: 'res' },
      { from: 'res', to: 'ag' },
    ],
  },

  rag: {
    nodes: [
      { id: 'docs', x: 70, y: 55, label: 'docs', w: 90 },
      { id: 'ch', x: 220, y: 55, label: 'chunk', tone: 'violet', w: 100 },
      { id: 'em', x: 370, y: 55, label: 'embed', tone: 'violet', w: 100 },
      { id: 'ix', x: 560, y: 55, label: 'vector index', tone: 'gold', w: 150 },
      { id: 'q', x: 70, y: 205, label: 'question', w: 110 },
      { id: 'ret', x: 370, y: 205, label: 'retrieve top-k', tone: 'ink', w: 150 },
      { id: 'llm', x: 580, y: 205, label: 'LLM', sub: 'prompt + chunks', tone: 'ink', w: 130 },
    ],
    edges: [
      { from: 'docs', to: 'ch' },
      { from: 'ch', to: 'em' },
      { from: 'em', to: 'ix' },
      { from: 'q', to: 'ret' },
      { from: 'ix', to: 'ret', label: 'similar' },
      { from: 'ret', to: 'llm' },
    ],
  },

  seq: {
    nodes: [
      { id: 'in', x: 55, y: 130, label: 'brief', w: 80 },
      { id: 'a', x: 210, y: 130, label: 'agent', sub: 'research', tone: 'ink', w: 120 },
      { id: 'b', x: 380, y: 130, label: 'agent', sub: 'write', tone: 'ink', w: 120 },
      { id: 'c', x: 550, y: 130, label: 'agent', sub: 'review', tone: 'ink', w: 120 },
    ],
    edges: [
      { from: 'in', to: 'a' },
      { from: 'a', to: 'b', label: 'notes' },
      { from: 'b', to: 'c', label: 'draft' },
    ],
  },

  mparallel: {
    nodes: [
      { id: 'in', x: 60, y: 130, label: 'question', w: 100 },
      { id: 'a', x: 270, y: 45, label: 'agent', sub: 'own context', tone: 'ink', w: 130 },
      { id: 'b', x: 270, y: 130, label: 'agent', sub: 'own context', tone: 'ink', w: 130 },
      { id: 'c', x: 270, y: 215, label: 'agent', sub: 'own context', tone: 'ink', w: 130 },
      { id: 'm', x: 470, y: 130, label: 'merge', sub: 'or reconcile', tone: 'gold', w: 120 },
      { id: 'out', x: 620, y: 130, label: 'answer', w: 84 },
    ],
    edges: [
      { from: 'in', to: 'a' },
      { from: 'in', to: 'b' },
      { from: 'in', to: 'c' },
      { from: 'a', to: 'm' },
      { from: 'b', to: 'm' },
      { from: 'c', to: 'm' },
      { from: 'm', to: 'out' },
    ],
  },

  supervisor: {
    nodes: [
      { id: 'u', x: 110, y: 55, label: 'user', w: 90 },
      { id: 's', x: 360, y: 55, label: 'supervisor', tone: 'gold', w: 150 },
      { id: 'a', x: 170, y: 205, label: 'subagent', sub: 'search', tone: 'ink', w: 130 },
      { id: 'b', x: 360, y: 205, label: 'subagent', sub: 'code', tone: 'ink', w: 130 },
      { id: 'c', x: 550, y: 205, label: 'subagent', sub: 'tests', tone: 'ink', w: 130 },
    ],
    edges: [
      { from: 'u', to: 's' },
      { from: 's', to: 'a', curve: 14 },
      { from: 'a', to: 's', curve: 14, dashed: true },
      { from: 's', to: 'b', curve: 14 },
      { from: 'b', to: 's', curve: 14, dashed: true },
      { from: 's', to: 'c', curve: 14 },
      { from: 'c', to: 's', curve: 14, dashed: true },
    ],
  },

  dispatcher: {
    nodes: [
      { id: 'in', x: 65, y: 130, label: 'request', w: 96 },
      { id: 'd', x: 230, y: 130, label: 'dispatcher', tone: 'gold', w: 130 },
      { id: 'a', x: 460, y: 45, label: 'billing agent', tone: 'paper', w: 160 },
      { id: 'b', x: 460, y: 130, label: 'tech agent', tone: 'ink', w: 160 },
      { id: 'c', x: 460, y: 215, label: 'sales agent', tone: 'paper', w: 160 },
    ],
    edges: [
      { from: 'in', to: 'd' },
      { from: 'd', to: 'a', dashed: true },
      { from: 'd', to: 'b', label: 'this one' },
      { from: 'd', to: 'c', dashed: true },
    ],
  },

  evalopt: {
    nodes: [
      { id: 'in', x: 60, y: 140, label: 'task', w: 84 },
      { id: 'o', x: 240, y: 140, label: 'optimizer', sub: 'agent', tone: 'ink', w: 140 },
      { id: 'e', x: 460, y: 140, label: 'evaluator', sub: 'agent', tone: 'gold', w: 140 },
      { id: 'out', x: 620, y: 140, label: 'done', w: 84 },
    ],
    edges: [
      { from: 'in', to: 'o' },
      { from: 'o', to: 'e', label: 'attempt' },
      { from: 'e', to: 'out', label: 'pass' },
      { from: 'e', to: 'o', curve: -80, dashed: true, label: 'critique · max N rounds' },
    ],
  },

  p2p: {
    nodes: [
      { id: 'a', x: 200, y: 50, label: 'agent', tone: 'ink', w: 110 },
      { id: 'b', x: 480, y: 50, label: 'agent', tone: 'ink', w: 110 },
      { id: 'c', x: 200, y: 210, label: 'agent', tone: 'ink', w: 110 },
      { id: 'd', x: 480, y: 210, label: 'agent', tone: 'ink', w: 110 },
    ],
    edges: [
      { from: 'a', to: 'b', plain: true },
      { from: 'a', to: 'c', plain: true },
      { from: 'a', to: 'd', plain: true },
      { from: 'b', to: 'c', plain: true },
      { from: 'b', to: 'd', plain: true },
      { from: 'c', to: 'd', plain: true },
    ],
  },
};
