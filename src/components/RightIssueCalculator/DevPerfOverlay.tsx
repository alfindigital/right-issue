import React, { useEffect, useState } from 'react';

type PerfState = {
  tab: string;
  switchMs: number | null;
  renderMs: number | null;
  renderPhase: 'mount' | 'update' | null;
};

const listeners = new Set<(s: PerfState) => void>();
let state: PerfState = { tab: 'calculator', switchMs: null, renderMs: null, renderPhase: null };

const setState = (patch: Partial<PerfState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l(state));
};

let switchStart: number | null = null;

export const perfMarkTabSwitchStart = (tab: string) => {
  if (!import.meta.env.DEV) return;
  switchStart = performance.now();
  setState({ tab, switchMs: null });
};

export const perfMarkTabSwitchEnd = () => {
  if (!import.meta.env.DEV) return;
  if (switchStart == null) return;
  const ms = performance.now() - switchStart;
  switchStart = null;
  setState({ switchMs: ms });
  // eslint-disable-next-line no-console
  console.log(`[perf] tab "${state.tab}" switch: ${ms.toFixed(1)}ms`);
};

export const onProfilerRender: React.ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
) => {
  if (!import.meta.env.DEV) return;
  setState({ renderMs: actualDuration, renderPhase: phase as 'mount' | 'update' });
  // eslint-disable-next-line no-console
  console.log(`[perf] <${id}> ${phase} render: ${actualDuration.toFixed(1)}ms`);
};

const fmt = (n: number | null) => (n == null ? '—' : `${n.toFixed(1)}ms`);

const DevPerfOverlay: React.FC = () => {
  const [s, setS] = useState<PerfState>(state);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const l = (next: PerfState) => setS(next);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  if (!import.meta.env.DEV || hidden) return null;

  const switchColor =
    s.switchMs == null ? 'text-muted-foreground' : s.switchMs < 50 ? 'text-emerald-400' : s.switchMs < 150 ? 'text-amber-400' : 'text-red-400';
  const renderColor =
    s.renderMs == null ? 'text-muted-foreground' : s.renderMs < 16 ? 'text-emerald-400' : s.renderMs < 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="fixed bottom-20 right-3 md:bottom-3 z-[100] pointer-events-auto select-none">
      <div className="rounded-xl border border-border/60 bg-background/85 backdrop-blur px-3 py-2 text-[11px] font-mono shadow-lg leading-tight">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">dev perf</span>
          <button
            onClick={() => setHidden(true)}
            className="text-muted-foreground hover:text-foreground text-xs leading-none"
            aria-label="Hide"
          >
            ×
          </button>
        </div>
        <div>tab: <span className="text-foreground">{s.tab}</span></div>
        <div>switch: <span className={switchColor}>{fmt(s.switchMs)}</span></div>
        <div>
          render{s.renderPhase ? ` (${s.renderPhase})` : ''}:{' '}
          <span className={renderColor}>{fmt(s.renderMs)}</span>
        </div>
      </div>
    </div>
  );
};

export default DevPerfOverlay;