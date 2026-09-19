import React from 'react';
import { LayoutGrid, Plus } from 'lucide-react';
import { useWorkspaceStore } from '@core/workspace/workspaceStore';
import { useWindowStore } from '@core/window/windowStore';

export const WorkspaceSwitcher: React.FC = () => {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
    toggleMissionControl,
    addWorkspace,
  } = useWorkspaceStore();
  const windows = useWindowStore((state) => state.windows);
  const windowList = Object.values(windows);

  return (
    <div className="flex items-center gap-1.5 font-mono text-[11px] select-none">
      {/* Spaces Pills */}
      <div className="flex items-center rounded-lg border border-border-subtle bg-surface-subtle/50 p-0.5 backdrop-blur-md">
        {workspaces.map((space) => {
          const isActive = space.id === activeWorkspaceId;
          const count = windowList.filter(
            (w) => (w.workspaceId ?? 1) === space.id && !w.isMinimized
          ).length;

          return (
            <button
              key={space.id}
              onClick={() => setActiveWorkspace(space.id)}
              className={`relative flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-all ${
                isActive
                  ? 'bg-accent text-accent-fg shadow-sm'
                  : 'text-content-tertiary hover:bg-surface-hover hover:text-content-primary'
              }`}
              title={`${space.name} (${count} open windows)`}
            >
              <span>{space.id}</span>
              {count > 0 && (
                <span
                  className={`h-1 w-1 rounded-full ${
                    isActive ? 'bg-white' : 'bg-accent'
                  }`}
                />
              )}
            </button>
          );
        })}

        {workspaces.length < 6 && (
          <button
            onClick={addWorkspace}
            title="Add Space"
            className="rounded-md px-1.5 py-0.5 text-content-tertiary hover:bg-surface-hover hover:text-content-primary transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Mission Control Trigger */}
      <button
        onClick={toggleMissionControl}
        title="Mission Control (Ctrl+Up)"
        className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-subtle/50 px-2 py-0.5 text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-all"
      >
        <LayoutGrid className="h-3 w-3 text-accent" />
        <span className="hidden sm:inline text-[10px] uppercase tracking-wider font-semibold">
          Spaces
        </span>
      </button>
    </div>
  );
};
