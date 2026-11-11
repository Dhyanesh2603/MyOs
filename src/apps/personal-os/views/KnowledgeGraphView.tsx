import React, { useState, useRef } from 'react';
import {
  Network,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowUpRight,
  Compass,
  FolderGit2,
  Code2,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { usePersonalOsStore, PersonalOsTab } from '@core/personal-os/personalOsStore';
import type { KnowledgeNode } from '@core/personal-os/types';
import { soundEngine } from '@core/audio/soundEngine';

export const KnowledgeGraphView: React.FC = () => {
  const {
    knowledgeNodes,
    knowledgeEdges,
    missions,
    projects,
    skills,
    subjects,
    companies,
    setActiveTab,
  } = usePersonalOsStore();

  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pan, setPan] = useState({ x: 40, y: 20 });
  const [zoom, setZoom] = useState(1.0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Dynamically derive graph from user entities plus any custom knowledgeNodes
  const allNodes: KnowledgeNode[] = React.useMemo(() => {
    const derived: KnowledgeNode[] = [];

    missions.forEach((m) => {
      derived.push({
        id: m.id,
        type: 'mission',
        label: m.title,
        details: m.tagline,
      });
    });

    projects.forEach((p) => {
      derived.push({
        id: p.id,
        type: 'project',
        label: p.name,
        details: p.description,
      });
    });

    skills.forEach((s) => {
      derived.push({
        id: s.id,
        type: 'skill',
        label: s.name,
        details: `${s.level} • ${s.estimatedMastery}% mastery`,
      });
    });

    subjects.forEach((sub) => {
      derived.push({
        id: sub.id,
        type: 'subject',
        label: `${sub.code} ${sub.name}`,
        details: sub.professor ? `Prof. ${sub.professor}` : undefined,
      });
    });

    companies.forEach((c) => {
      derived.push({
        id: c.id,
        type: 'company',
        label: c.companyName,
        details: `${c.role} • ${c.stage}`,
      });
    });

    knowledgeNodes.forEach((kn) => {
      if (!derived.some((d) => d.id === kn.id)) {
        derived.push(kn);
      }
    });

    return derived;
  }, [missions, projects, skills, subjects, companies, knowledgeNodes]);

  const allEdges = React.useMemo(() => {
    const edges: typeof knowledgeEdges = [...knowledgeEdges];

    missions.forEach((m) => {
      m.projectIds?.forEach((pid) => {
        edges.push({
          id: `edge-${m.id}-${pid}`,
          source: m.id,
          target: pid,
          relation: 'funds / organizes',
        });
      });
    });

    skills.forEach((s) => {
      s.projectIds?.forEach((pid) => {
        edges.push({
          id: `edge-${s.id}-${pid}`,
          source: s.id,
          target: pid,
          relation: 'powers',
        });
      });
    });

    return edges;
  }, [missions, skills, knowledgeEdges]);

  // Dynamically compute layout coordinates per group
  const nodeCoordinates = React.useMemo(() => {
    const coords: Record<string, { x: number; y: number }> = {};
    const groups: Record<string, KnowledgeNode[]> = {
      company: [],
      mission: [],
      project: [],
      skill: [],
      subject: [],
    };

    allNodes.forEach((n) => {
      const list = groups[n.type] ?? [];
      list.push(n);
      groups[n.type] = list;
    });

    const yOffsets: Record<string, number> = {
      company: 90,
      mission: 220,
      project: 360,
      skill: 500,
      subject: 630,
    };

    Object.entries(groups).forEach(([type, typeNodes]) => {
      const y = yOffsets[type] || 320;
      const spacing = 220;
      const startX = 220;
      typeNodes.forEach((node, i) => {
        coords[node.id] = {
          x: startX + i * spacing,
          y: y,
        };
      });
    });

    return coords;
  }, [allNodes]);

  const activeNode = allNodes.find((n) => n.id === selectedNodeId) || allNodes[0];

  // Connected edges for the selected node
  const connectedEdges = allEdges.filter(
    (e) => e.source === activeNode?.id || e.target === activeNode?.id
  );

  // Connected neighbor node IDs
  const connectedNodeIds = new Set<string>([
    activeNode?.id || '',
    ...connectedEdges.map((e) => (e.source === activeNode?.id ? e.target : e.source)),
  ]);

  const filteredNodes = allNodes.filter((n) => {
    const matchesFilter = filterType === 'all' || n.type === filterType;
    const matchesSearch = n.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const getNodeColor = (type: KnowledgeNode['type']) => {
    switch (type) {
      case 'mission':
        return { bg: '#818cf8', stroke: '#6366f1', text: '#e0e7ff', icon: Compass };
      case 'project':
        return { bg: '#38bdf8', stroke: '#0284c7', text: '#e0f2fe', icon: FolderGit2 };
      case 'skill':
        return { bg: '#34d399', stroke: '#059669', text: '#ecfdf5', icon: Code2 };
      case 'subject':
        return { bg: '#fbbf24', stroke: '#d97706', text: '#fffbeb', icon: GraduationCap };
      case 'company':
        return { bg: '#f43f5e', stroke: '#e11d48', text: '#ffe4e6', icon: Building2 };
      default:
        return { bg: '#a3a3a3', stroke: '#737373', text: '#fafafa', icon: Network };
    }
  };

  const handleNavigateToEntity = (node: KnowledgeNode) => {
    soundEngine.playClick();
    const tabMap: Record<string, PersonalOsTab> = {
      mission: 'missions',
      project: 'projects',
      skill: 'learning',
      subject: 'academics',
      company: 'career',
    };
    const target = tabMap[node.type];
    if (target) {
      setActiveTab(target);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-6 font-sans text-neutral-200 h-full">
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-neutral-300" />
            <h2 className="text-xl font-medium tracking-tight text-white">
              Relational Knowledge Graph
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Visual brain linking missions, software projects, skills, university coursework, and career targets.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search graph..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-44 rounded-xl border border-white/10 bg-white/5 pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-white/30"
            />
          </div>

          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
              className="rounded p-1 text-neutral-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[42px] text-center font-mono text-[11px] text-neutral-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
              className="rounded p-1 text-neutral-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1.0);
                setPan({ x: 40, y: 20 });
              }}
              className="rounded p-1 text-neutral-400 hover:text-white ml-0.5"
              title="Reset"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Type Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/5 pb-2 text-xs font-mono">
        {(['all', 'project', 'skill', 'subject', 'company', 'mission'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              soundEngine.playClick();
              setFilterType(t);
            }}
            className={`rounded-lg px-2.5 py-1 capitalize transition-colors ${
              filterType === t
                ? 'bg-white/15 text-white font-medium'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 3. Main Vector Graph Canvas & Relational Inspector or Empty State */}
      {allNodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-white/10 bg-white/[0.02] text-center my-auto min-h-[460px]">
          <Network className="h-12 w-12 text-neutral-600 mb-4" />
          <h3 className="text-base font-medium text-white">Knowledge Graph Empty</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-md">
            As you define engineering campaigns, software projects, skills, and university coursework, Onyx OS automatically connects and plots their relational graph here.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('missions');
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-mono text-white hover:bg-white/20 transition-all shadow-sm"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Create Campaign</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('projects');
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono text-neutral-300 hover:bg-white/10 transition-all shadow-sm"
            >
              <FolderGit2 className="h-3.5 w-3.5" />
              <span>Add Project</span>
            </button>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[460px]">
        {/* Graph Canvas (8 cols) */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="lg:col-span-8 relative rounded-2xl border border-white/10 bg-[#090d14] overflow-hidden cursor-grab active:cursor-grabbing shadow-inner select-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.08) 1.2px, transparent 0)`,
            backgroundSize: `${28 * zoom}px ${28 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        >
          {/* Transformable Canvas Surface */}
          <div
            className="absolute inset-0 origin-top-left"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* SVG Edges Layer */}
            <svg className="absolute inset-0 overflow-visible w-full h-full pointer-events-none">
              <defs>
                <marker
                  id="arrow-kg"
                  markerWidth="8"
                  markerHeight="6"
                  refX="14"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="rgba(255, 255, 255, 0.4)" />
                </marker>
              </defs>

              {allEdges.map((edge) => {
                const srcPos = nodeCoordinates[edge.source] || { x: 300, y: 300 };
                const tgtPos = nodeCoordinates[edge.target] || { x: 500, y: 300 };
                const isHighlighted =
                  edge.source === activeNode?.id || edge.target === activeNode?.id;

                return (
                  <g key={edge.id}>
                    <line
                      x1={srcPos.x}
                      y1={srcPos.y}
                      x2={tgtPos.x}
                      y2={tgtPos.y}
                      stroke={isHighlighted ? '#ffffff' : 'rgba(255, 255, 255, 0.15)'}
                      strokeWidth={isHighlighted ? 2.5 : 1.2}
                      strokeDasharray={isHighlighted ? '4,4' : undefined}
                      className={isHighlighted ? 'animate-pulse' : ''}
                      markerEnd="url(#arrow-kg)"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nodes Layer */}
            {filteredNodes.map((node) => {
              const pos = nodeCoordinates[node.id] || { x: 400, y: 300 };
              const isSelected = activeNode?.id === node.id;
              const isConnected = connectedNodeIds.has(node.id);
              const colorDef = getNodeColor(node.type);
              const Icon = colorDef.icon;

              return (
                <div
                  key={node.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEngine.playClick();
                    setSelectedNodeId(node.id);
                  }}
                  style={{
                    position: 'absolute',
                    left: pos.x - 70,
                    top: pos.y - 22,
                    opacity: isConnected || isSelected ? 1.0 : 0.25,
                  }}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-all cursor-pointer shadow-lg ${
                    isSelected
                      ? 'border-white bg-white/25 ring-2 ring-white/40 scale-110 z-20'
                      : 'border-white/15 bg-neutral-900/90 hover:border-white/30 hover:scale-105 z-10'
                  }`}
                >
                  <div
                    style={{ backgroundColor: colorDef.bg }}
                    className="flex h-5 w-5 items-center justify-center rounded-md text-black shadow-inner"
                  >
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-white tracking-tight">
                      {node.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Relational Inspector Side Drawer (4 cols) */}
        {activeNode && (
          <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-white/15 bg-white/[0.03] p-5 shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-neutral-300">
                  {activeNode.type}
                </span>
                <button
                  onClick={() => handleNavigateToEntity(activeNode)}
                  className="flex items-center gap-1 font-mono text-[11px] text-neutral-300 hover:text-white transition-colors"
                >
                  <span>Open Details</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <h3 className="text-base font-semibold text-white tracking-tight mt-3">
                {activeNode.label}
              </h3>
              {activeNode.details && (
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{activeNode.details}</p>
              )}

              {/* Connected Relationships Matrix */}
              <div className="mt-5 pt-3 border-t border-white/10">
                <div className="text-[10px] font-mono uppercase text-neutral-400 mb-2.5">
                  Connected Relationships ({connectedEdges.length})
                </div>

                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {connectedEdges.map((edge) => {
                    const isOutbound = edge.source === activeNode.id;
                    const otherNodeId = isOutbound ? edge.target : edge.source;
                    const otherNode = allNodes.find((n) => n.id === otherNodeId);
                    if (!otherNode) return null;

                    return (
                      <div
                        key={edge.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedNodeId(otherNode.id);
                        }}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2.5 hover:border-white/15 hover:bg-white/[0.05] transition-all cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="rounded bg-white/10 px-1.5 py-0.2 font-mono text-[9px] uppercase text-neutral-300">
                            {edge.relation}
                          </span>
                          <span className="truncate font-medium text-white">{otherNode.label}</span>
                        </div>
                        <span className="font-mono text-[10px] text-neutral-500 capitalize shrink-0 ml-1">
                          {otherNode.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => handleNavigateToEntity(activeNode)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2 text-xs font-semibold font-mono text-white hover:bg-white/20 transition-colors"
              >
                <span>Jump to {activeNode.type} Workspace</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};
