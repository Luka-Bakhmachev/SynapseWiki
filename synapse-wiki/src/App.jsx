import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

import {
  Search,
  Plus,
  Trash2,
  Edit3,
  BookOpen,
  Eye,
  Settings,
  Globe,
  Share2,
  FileText,
  Tag,
  Link as LinkIcon,
  Unlink,
  Check,
  X,
  ExternalLink,
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  RefreshCw,
  Folder,
  Layers,
  HelpCircle,
  Download,
  AlertCircle,
  Network,
  Split,
  ArrowUpRight,
  Compass,
  Code,
  LayoutGrid,
  ChevronRight,
  ChevronDown,
  Database,
  Cpu,
  GitBranch,
  Sliders,
  Maximize,
  Minimize,
  Info,
  Lock,
  Shield,
  File,
} from "lucide-react";

// ==========================================
// PRE-POPULATED DEMO VAULT DATA
// ==========================================
const INITIAL_DEMO_NOTES = [
  {
    id: "note-1",
    title: "Quantum Computing",
    path: "/Physics/Quantum Computing.md",
    content: `# Quantum Computing

Quantum computing is a rapidly-emerging technology that harnesses the laws of quantum mechanics to solve problems too complex for classical computers.

Core elements include [[Qubit]] systems and [[Superposition]] states to achieve exponential processing capability.

Key architectural concepts rely heavily on [[Graph Theory]] for mapping qubit connectivity and error correction topologies.

See also: [[SynapseWiki Specs]] and [[Entanglement]].

#physics #tech #quantum #computing`,
    tags: ["physics", "tech", "quantum", "computing"],
    links: [
      "Qubit",
      "Superposition",
      "Graph Theory",
      "SynapseWiki Specs",
      "Entanglement",
    ],
    isWikiImport: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "note-2",
    title: "Qubit",
    path: "/Physics/Qubit.md",
    content: `# Qubit

A quantum bit or **qubit** is the basic unit of quantum information—the quantum counterpart to the classical binary bit.

### Key Behaviors:
- Leverages [[Superposition]] to exist in combinations of |0⟩ and |1⟩ simultaneously.
- Exhibits [[Entanglement]] when interacting with partner qubits.
- Forms the computational backbone of [[Quantum Computing]].

#physics #quantum #hardware`,
    tags: ["physics", "quantum", "hardware"],
    links: ["Superposition", "Entanglement", "Quantum Computing"],
    isWikiImport: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "note-3",
    title: "Superposition",
    path: "/Physics/Superposition.md",
    content: `# Superposition

A fundamental principle of quantum mechanics where a physical system exists in a linear combination of multiple states simultaneously until measured.

In [[Quantum Computing]], superposition allows a [[Qubit]] to process exponentially larger computational state spaces compared to classical bits.

#physics #quantum #theory`,
    tags: ["physics", "quantum", "theory"],
    links: ["Quantum Computing", "Qubit"],
    isWikiImport: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "note-4",
    title: "Entanglement",
    path: "/Physics/Entanglement.md",
    content: `# Entanglement

Quantum entanglement is a phenomenon where quantum particles become inextricably linked, such that the quantum state of one instantly dictates the state of another.

Crucial for quantum teleportation and dense [[Qubit]] communication channels in [[Quantum Computing]].

#physics #quantum #phenomena`,
    tags: ["physics", "quantum", "phenomena"],
    links: ["Qubit", "Quantum Computing"],
    isWikiImport: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "note-5",
    title: "SynapseWiki Specs",
    path: "/Projects/SynapseWiki Specs.md",
    content: `# SynapseWiki Specs

SynapseWiki is a local-first, graph-first knowledge base featuring visual link refactoring and live Wikipedia network graph exploration.
### Core Architecture:
- **Graph Topology**: Powered by [[Graph Theory]] for visual layout and connection routing.
- **Link Mutator**: Real-time AST refactoring when dragging edges on canvas.
- **Wikipedia Engine**: 1-click imports from live research into local notes like [[Quantum Computing]].

#pkm #project #dev #specs`,
    tags: ["pkm", "project", "dev", "specs"],
    links: ["Graph Theory", "Quantum Computing"],
    isWikiImport: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "note-6",
    title: "Graph Theory",
    path: "/Math/Graph Theory.md",
    content: `# Graph Theory

In mathematics and computer science, graph theory is the study of graphs—mathematical structures used to model pairwise relations between objects.

### Applications in SynapseWiki:
- Bridges personal vaults with live research maps.
- Serves as the mathematical foundation for [[SynapseWiki Specs]].
- Connects complex domain topics in [[Quantum Computing]].

#math #computer-science #algorithms`,
    tags: ["math", "computer-science", "algorithms"],
    links: ["SynapseWiki Specs", "Quantum Computing"],
    isWikiImport: false,
    updatedAt: new Date().toISOString(),
  },
];

// Helper to safely regex escape strings
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Helper to extract [[wikilinks]] from Markdown content
const extractWikilinks = (text) => {
  if (!text) return [];
  const regex = /\[\[([^\]\|]+)(?:\|[^\]]+)?\]\]/g;
  const links = new Set();
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1] && match[1].trim()) {
      links.add(match[1].trim());
    }
  }
  return Array.from(links);
};

// Helper to extract #tags from Markdown content
const extractTags = (text) => {
  if (!text) return [];
  const regex = /(?:^|\s)#([a-zA-Z0-9_\-]+)/g;
  const tags = new Set();
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1] && match[1].trim()) {
      tags.add(match[1].trim().toLowerCase());
    }
  }
  return Array.from(tags);
};

export default function App() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("synapsewiki_notes");
    return saved ? JSON.parse(saved) : INITIAL_DEMO_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState("note-1");
  const [viewMode, setViewMode] = useState("split"); // 'canvas', 'split', 'editor'
  const [editorTab, setEditorTab] = useState("edit"); // 'edit', 'preview'
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  // External Wikipedia Search State
  const [wikiSearchQuery, setWikiSearchQuery] = useState("");
  const [wikiSearchResults, setWikiSearchResults] = useState([]);
  const [isWikiSearching, setIsWikiSearching] = useState(false);
  const [wikiNodes, setWikiNodes] = useState([]); // Nodes fetched from Wikipedia not yet imported
  const [wikiActiveArticle, setWikiActiveArticle] = useState(null);
  const [showWikiPanel, setShowWikiPanel] = useState(true);

  // Command Palette / Quick Search Modal
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Toasts Notification State
  const [toasts, setToasts] = useState([]);

  // Graph Canvas State
  const [canvasNodes, setCanvasNodes] = useState([]);
  const [nodePositions, setNodePositions] = useState({});
  const [selectedCanvasNodeId, setSelectedCanvasNodeId] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null); // { source, target }
  const [dragConnection, setDragConnection] = useState(null); // { sourceId, currentX, currentY }
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeNoteId) || notes[0];
  }, [notes, activeNoteId]);

  // Persistent Storage
  useEffect(() => {
    localStorage.setItem("synapsewiki_notes", JSON.stringify(notes));
  }, [notes]);

  // Toast Dispatcher
  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Keyboard Shortcuts (Cmd+K for Command Palette)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ==========================================
  // WIKIPEDIA LIVE API INTEGRATION
  // ==========================================
  const searchWikipedia = async (query) => {
    if (!query.trim()) return;
    setIsWikiSearching(true);
    try {
      // 1. Search for matching titles
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query,
      )}&utf8=&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (!searchData.query || !searchData.query.search.length) {
        addToast(`No Wikipedia results found for "${query}"`, "warning");
        setWikiSearchResults([]);
        setIsWikiSearching(false);
        return;
      }

      const results = searchData.query.search.slice(0, 5);
      setWikiSearchResults(results);

      // Fetch primary title details & 1-hop sublinks
      const primaryTitle = results[0].title;
      await fetchWikipediaArticleNetwork(primaryTitle);
    } catch (err) {
      console.error("Wikipedia API Error:", err);
      addToast("Failed to fetch from Wikipedia API", "error");
    } finally {
      setIsWikiSearching(false);
    }
  };

  const fetchWikipediaArticleNetwork = async (title) => {
    setIsWikiSearching(true);
    try {
      const detailsUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        title,
      )}&prop=extracts|links&exintro=1&explaintext=1&pllimit=10&format=json&origin=*`;
      const res = await fetch(detailsUrl);
      const data = await res.json();

      const pages = data.query?.pages || {};
      const pageId = Object.keys(pages)[0];
      const page = pages[pageId];

      if (!page || page.missing !== undefined) {
        addToast(`Could not load Wikipedia page for "${title}"`, "error");
        return;
      }

      const extract = page.extract || "No description available.";
      const rawLinks = (page.links || []).map((l) => l.title);

      const mainWikiNode = {
        id: `wiki-${title.replace(/\s+/g, "_")}`,
        title: title,
        summary: extract,
        links: rawLinks,
        isWikiNode: true,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      };

      setWikiActiveArticle(mainWikiNode);

      // Create external Wikipedia nodes for canvas visualization
      const subWikiNodes = rawLinks.slice(0, 6).map((subTitle) => ({
        id: `wiki-${subTitle.replace(/\s+/g, "_")}`,
        title: subTitle,
        summary: `Linked article from ${title} network.`,
        links: [title],
        isWikiNode: true,
        parentTitle: title,
      }));

      // Merge into wikiNodes canvas state without duplicates
      setWikiNodes((prev) => {
        const existingTitles = new Set(prev.map((n) => n.title));
        const filteredNew = [mainWikiNode, ...subWikiNodes].filter(
          (n) => !existingTitles.has(n.title),
        );
        return [...prev, ...filteredNew];
      });

      addToast(`Loaded Wikipedia network for "${title}" on Canvas`, "success");
    } catch (err) {
      console.error(err);
      addToast("Error fetching Wikipedia article network", "error");
    } finally {
      setIsWikiSearching(false);
    }
  };

  // Convert a Wikipedia Node to a Local Vault Note (.md)
  const importWikipediaNode = (wikiNode) => {
    // Check if note already exists locally
    const existing = notes.find(
      (n) => n.title.toLowerCase() === wikiNode.title.toLowerCase(),
    );

    if (existing) {
      addToast(`"${wikiNode.title}" already exists in your vault`, "info");
      setActiveNoteId(existing.id);
      return;
    }

    const wikilinkMatches = (wikiNode.links || [])
      .slice(0, 5)
      .map((l) => `[[${l}]]`)
      .join(", ");

    const newNoteContent = `# ${wikiNode.title}\n\n*Imported from Wikipedia research graph.*\n\n${
      wikiNode.summary || "Summary unavailable."
    }\n\n### Connected Wikipedia Concepts:\n${wikilinkMatches}\n\n#wikipedia #research #imported`;

    const newNote = {
      id: `note-${Date.now()}`,
      title: wikiNode.title,
      path: `/Wikipedia/${wikiNode.title}.md`,
      content: newNoteContent,
      tags: extractTags(newNoteContent),
      links: extractWikilinks(newNoteContent),
      isWikiImport: true,
      updatedAt: new Date().toISOString(),
    };

    setNotes((prev) => [...prev, newNote]);

    // Remove from unimported wikiNodes array
    setWikiNodes((prev) => prev.filter((w) => w.title !== wikiNode.title));

    setActiveNoteId(newNote.id);
    addToast(`Imported "${wikiNode.title}" into local vault as .md`, "success");
  };

  // ==========================================
  // NOTE MUTATIONS & REFACORING ENGINE
  // ==========================================
  const updateNoteContent = (noteId, newContent) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id !== noteId) return note;
        return {
          ...note,
          content: newContent,
          tags: extractTags(newContent),
          links: extractWikilinks(newContent),
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  const createNewNote = (title = "Untitled Note") => {
    let finalTitle = title;
    let count = 1;
    while (
      notes.some((n) => n.title.toLowerCase() === finalTitle.toLowerCase())
    ) {
      finalTitle = `${title} ${count++}`;
    }

    const newNote = {
      id: `note-${Date.now()}`,
      title: finalTitle,
      path: `/${finalTitle}.md`,
      content: `# ${finalTitle}\n\nStart writing here... Connect to other notes using [[wikilinks]].\n\n#notes`,
      tags: ["notes"],
      links: [],
      isWikiImport: false,
      updatedAt: new Date().toISOString(),
    };

    setNotes((prev) => [...prev, newNote]);
    setActiveNoteId(newNote.id);
    addToast(`Created new note: ${finalTitle}`, "success");
  };

  const deleteNote = (noteId) => {
    const target = notes.find((n) => n.id === noteId);
    if (!target) return;

    if (notes.length <= 1) {
      addToast("Cannot delete the last remaining note in the vault", "warning");
      return;
    }

    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    const remaining = notes.filter((n) => n.id !== noteId);
    if (activeNoteId === noteId) {
      setActiveNoteId(remaining[0].id);
    }
    addToast(`Deleted note: ${target.title}`, "info");
  };

  // Refactor links: Add [[Target]] to Source Note's content
  const addVisualLink = (sourceTitle, targetTitle) => {
    if (sourceTitle === targetTitle) return;

    const sourceNote = notes.find(
      (n) => n.title.toLowerCase() === sourceTitle.toLowerCase(),
    );

    if (!sourceNote) {
      addToast(
        `Cannot link: Source note "${sourceTitle}" is external`,
        "warning",
      );
      return;
    }

    // Check if link already exists in content
    const wikilinkStr = `[[${targetTitle}]]`;
    if (sourceNote.content.includes(wikilinkStr)) {
      addToast(
        `Link to [[${targetTitle}]] already exists in ${sourceTitle}`,
        "info",
      );
      return;
    }

    // Append wikilink to source note content
    const updatedContent = `${sourceNote.content}\n\nRelated: ${wikilinkStr}`;
    updateNoteContent(sourceNote.id, updatedContent);

    addToast(
      `Refactored AST: Added [[${targetTitle}]] to ${sourceNote.title}`,
      "success",
    );
  };

  // Refactor links: Remove [[Target]] from Source Note's content
  const removeVisualLink = (sourceTitle, targetTitle) => {
    const sourceNote = notes.find(
      (n) => n.title.toLowerCase() === sourceTitle.toLowerCase(),
    );

    if (!sourceNote) return;

    // Remove [[targetTitle]] pattern from content
    const regex = new RegExp(
      `\\[\\[${escapeRegExp(targetTitle)}(?:\\|[^\\]]+)?\\]\\]`,
      "gi",
    );
    const updatedContent = sourceNote.content.replace(regex, "").trim();

    updateNoteContent(sourceNote.id, updatedContent);
    setSelectedEdge(null);
    addToast(
      `Refactored AST: Removed [[${targetTitle}]] link from ${sourceNote.title}`,
      "info",
    );
  };

  const resetDemoVault = () => {
    setNotes(INITIAL_DEMO_NOTES);
    setActiveNoteId("note-1");
    setWikiNodes([]);
    setWikiActiveArticle(null);
    localStorage.removeItem("synapsewiki_notes");
    addToast("Reset vault to original pre-populated state", "success");
  };

  // All Tags in Vault
  const allVaultTags = useMemo(() => {
    const tagCounts = {};
    notes.forEach((n) => {
      (n.tags || []).forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });
    return Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  // Backlinks for Active Note
  const activeNoteBacklinks = useMemo(() => {
    if (!activeNote) return [];
    return notes.filter(
      (n) =>
        n.id !== activeNote.id &&
        (n.links || []).some(
          (l) => l.toLowerCase() === activeNote.title.toLowerCase(),
        ),
    );
  }, [notes, activeNote]);

  // ==========================================
  // GRAPH CANVAS INITIALIZATION & POSITIONING
  // ==========================================
  const allGraphNodes = useMemo(() => {
    // Local vault notes
    const localNodes = notes.map((n) => ({
      id: n.id,
      title: n.title,
      type: "local",
      tags: n.tags,
      isWikiImport: n.isWikiImport,
      links: n.links || [],
    }));

    // External Wikipedia nodes not imported yet
    const externalWikiNodes = wikiNodes
      .filter(
        (w) =>
          !notes.some((n) => n.title.toLowerCase() === w.title.toLowerCase()),
      )
      .map((w) => ({
        id: w.id,
        title: w.title,
        type: "wikipedia",
        tags: ["wikipedia"],
        summary: w.summary,
        links: w.links || [],
        rawWikiObj: w,
      }));

    return [...localNodes, ...externalWikiNodes];
  }, [notes, wikiNodes]);

  // Derive all active graph edges
  const allGraphEdges = useMemo(() => {
    const edges = [];
    const nodeTitleToId = {};
    allGraphNodes.forEach((n) => {
      nodeTitleToId[n.title.toLowerCase()] = n.id;
    });

    allGraphNodes.forEach((sourceNode) => {
      (sourceNode.links || []).forEach((targetTitle) => {
        const targetId = nodeTitleToId[targetTitle.toLowerCase()];
        if (targetId) {
          edges.push({
            id: `edge-${sourceNode.id}-${targetId}`,
            source: sourceNode.id,
            target: targetId,
            sourceTitle: sourceNode.title,
            targetTitle: targetTitle,
            type:
              sourceNode.type === "wikipedia" || targetId.startsWith("wiki-")
                ? "wiki"
                : "local",
          });
        }
      });
    });

    return edges;
  }, [allGraphNodes]);

  // Circular / Dynamic Layout Positioning for Nodes
  useEffect(() => {
    setNodePositions((prevPositions) => {
      const updated = { ...prevPositions };
      const radius = Math.min(window.innerWidth * 0.25, 260);
      const centerX = 380;
      const centerY = 320;

      allGraphNodes.forEach((node, index) => {
        if (!updated[node.id]) {
          const angle = (index / allGraphNodes.length) * 2 * Math.PI;
          // Offset external wikipedia nodes slightly further out
          const r = node.type === "wikipedia" ? radius * 1.4 : radius;
          updated[node.id] = {
            x: centerX + r * Math.cos(angle) + (Math.random() * 20 - 10),
            y: centerY + r * Math.sin(angle) + (Math.random() * 20 - 10),
          };
        }
      });
      return updated;
    });
  }, [allGraphNodes]);

  // Handle Dragging Canvas Nodes
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation();
    if (e.shiftKey) {
      // Shift + Drag creates a new connection link!
      const pos = nodePositions[nodeId] || { x: 0, y: 0 };
      setDragConnection({
        sourceId: nodeId,
        currentX: pos.x,
        currentY: pos.y,
      });
      return;
    }

    setDraggingNodeId(nodeId);
    dragStartPos.current = { x: e.clientX, y: e.clientY };

    // Select node in vault if local
    const localNote = notes.find((n) => n.id === nodeId);
    if (localNote) {
      setActiveNoteId(localNote.id);
    }
    setSelectedCanvasNodeId(nodeId);
    setSelectedEdge(null);
  };

  const handleCanvasMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = (e.clientX - svgRect.left - panOffset.x) / zoomLevel;
    const mouseY = (e.clientY - svgRect.top - panOffset.y) / zoomLevel;

    if (dragConnection) {
      setDragConnection((prev) => ({
        ...prev,
        currentX: mouseX,
        currentY: mouseY,
      }));
      return;
    }

    if (draggingNodeId) {
      const dx = (e.clientX - dragStartPos.current.x) / zoomLevel;
      const dy = (e.clientY - dragStartPos.current.y) / zoomLevel;
      dragStartPos.current = { x: e.clientX, y: e.clientY };

      setNodePositions((prev) => ({
        ...prev,
        [draggingNodeId]: {
          x: (prev[draggingNodeId]?.x || 0) + dx,
          y: (prev[draggingNodeId]?.y || 0) + dy,
        },
      }));
    }
  };

  const handleCanvasMouseUp = (e) => {
    if (dragConnection) {
      // Check if mouse released over another target node
      const targetElement = document.elementFromPoint(e.clientX, e.clientY);
      const nodeGroup = targetElement?.closest("[data-node-id]");
      if (nodeGroup) {
        const targetNodeId = nodeGroup.getAttribute("data-node-id");
        if (targetNodeId && targetNodeId !== dragConnection.sourceId) {
          const sourceNode = allGraphNodes.find(
            (n) => n.id === dragConnection.sourceId,
          );
          const targetNode = allGraphNodes.find((n) => n.id === targetNodeId);

          if (sourceNode && targetNode) {
            addVisualLink(sourceNode.title, targetNode.title);
          }
        }
      }
      setDragConnection(null);
    }

    setDraggingNodeId(null);
  };

  // Filter Match Logic
  const isNodeMatchingFilter = (node) => {
    if (selectedTag) {
      return (node.tags || []).includes(selectedTag);
    }
    if (!searchFilter.trim()) return true;
    const query = searchFilter.toLowerCase();
    return (
      node.title.toLowerCase().includes(query) ||
      (node.tags || []).some((t) => t.toLowerCase().includes(query))
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* ========================================== */}
      {/* HEADER BAR */}
      {/* ========================================== */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 shadow-lg shadow-indigo-500/20">
            <Network className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 text-lg">
                SynapseWiki
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v1.1 Graph
              </span>
            </div>
          </div>
        </div>

        {/* Global Controls & View Toggles */}
        <div className="flex items-center space-x-3">
          {/* Search / Filter Bar */}
          <div className="relative w-64 hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter canvas nodes or #tags..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter("")}
                className="absolute right-2 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex bg-slate-950/80 p-1 rounded-lg border border-slate-800/80 text-xs font-medium">
            <button
              onClick={() => setViewMode("canvas")}
              className={`px-3 py-1 rounded-md flex items-center space-x-1.5 transition ${
                viewMode === "canvas"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Canvas Graph Only"
            >
              <Network className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Graph</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1 rounded-md flex items-center space-x-1.5 transition ${
                viewMode === "split"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Split Workspace View"
            >
              <Split className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode("editor")}
              className={`px-3 py-1 rounded-md flex items-center space-x-1.5 transition ${
                viewMode === "editor"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Editor Only"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editor</span>
            </button>
          </div>

          {/* Wikipedia Panel Toggle */}
          <button
            onClick={() => setShowWikiPanel(!showWikiPanel)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1.5 transition ${
              showWikiPanel
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                : "border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Wikipedia Live</span>
          </button>

          {/* Quick Command Palette Button */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:border-slate-700 transition flex items-center space-x-1 text-xs px-2"
            title="Quick Switcher (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <kbd className="hidden lg:inline text-[10px] bg-slate-950 px-1 py-0.5 rounded text-slate-400 border border-slate-800">
              ⌘K
            </kbd>
          </button>

          {/* Reset Demo State Button */}
          <button
            onClick={resetDemoVault}
            className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition"
            title="Reset Demo Vault"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ========================================== */}
      {/* MAIN WORKSPACE BODY */}
      {/* ========================================== */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT SIDEBAR: Vault Tree & Wikipedia Explorer */}
        <aside className="w-80 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-col z-20 shrink-0">
          {/* Vault Header & New Note Action */}
          <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Folder className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Personal Vault
              </span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                {notes.length}
              </span>
            </div>
            <button
              onClick={() => createNewNote()}
              className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs flex items-center space-x-1 px-2 transition shadow-sm"
              title="Create New Note"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Note</span>
            </button>
          </div>

          {/* Vault File List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {notes.map((note) => {
              const isActive = note.id === activeNoteId;
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition ${
                    isActive
                      ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 font-medium"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileText
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? "text-indigo-400" : "text-slate-500"
                      }`}
                    />
                    <span className="truncate">{note.title}</span>
                    {note.isWikiImport && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 shrink-0">
                        Wiki
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* WIKIPEDIA RESEARCH EXPLORER SECTION */}
          {showWikiPanel && (
            <div className="border-t border-slate-800/80 bg-slate-950/40 p-3 flex flex-col h-1/2 min-h-[220px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                  <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                    Wikipedia Live Graph
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  MediaWiki API
                </span>
              </div>

              {/* Wikipedia Live Search Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  searchWikipedia(wikiSearchQuery);
                }}
                className="flex items-center space-x-1.5 mb-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search Wikipedia topic..."
                    value={wikiSearchQuery}
                    onChange={(e) => setWikiSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-3 pr-7 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {isWikiSearching && (
                    <Sparkles className="w-3 h-3 text-cyan-400 animate-spin absolute right-2 top-2" />
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isWikiSearching}
                  className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg transition disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Wikipedia Search Results & Active Preview */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar text-xs">
                {wikiActiveArticle ? (
                  <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-cyan-200 text-xs">
                        {wikiActiveArticle.title}
                      </h4>
                      <button
                        onClick={() => importWikipediaNode(wikiActiveArticle)}
                        className="p-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded text-[10px] flex items-center space-x-1 transition shadow-sm"
                        title="Convert Wikipedia node to local .md file"
                      >
                        <Download className="w-3 h-3" />
                        <span>Import .md</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                      {wikiActiveArticle.summary}
                    </p>
                    {wikiActiveArticle.links && (
                      <div className="pt-1">
                        <span className="text-[10px] text-cyan-400/80 font-medium block mb-1">
                          1-Hop Article Network (
                          {wikiActiveArticle.links.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {wikiActiveArticle.links.slice(0, 5).map((l, i) => (
                            <span
                              key={i}
                              onClick={() => fetchWikipediaArticleNetwork(l)}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 hover:bg-cyan-900/50 text-cyan-300 border border-slate-800 cursor-pointer transition"
                            >
                              + {l}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 space-y-1">
                    <Compass className="w-6 h-6 mx-auto text-slate-600" />
                    <p className="text-[11px]">
                      Search any Wikipedia topic above to render research graphs
                      directly onto your canvas.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAGS CLOUD SUMMARY */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3 text-indigo-400" /> Vault Tags
              </span>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-[10px] text-indigo-400 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {allVaultTags.map(([tag, count]) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-400"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    #{tag} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CENTER & RIGHT AREAS (DYNAMIC BASED ON VIEWMODE) */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* 1. CANVAS GRAPH VIEW */}
          {(viewMode === "canvas" || viewMode === "split") && (
            <div
              className={`relative bg-slate-950 flex-1 h-full overflow-hidden ${
                viewMode === "split" ? "border-r border-slate-800/80" : ""
              }`}
            >
              {/* Canvas Controls Overlay */}
              <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 shadow-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  Canvas Instructions:
                </span>
                <span className="text-[11px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                  Drag nodes to layout
                </span>
                <span className="text-[11px] text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                  Shift+Drag to connect [[links]]
                </span>
              </div>

              {/* Selected Edge Actions Floating Popup */}
              {selectedEdge && (
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-20 bg-slate-900 border border-slate-800 p-2.5 rounded-xl shadow-2xl flex items-center space-x-3 text-xs animate-in fade-in zoom-in-95">
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <span className="font-semibold text-indigo-400">
                      {selectedEdge.sourceTitle}
                    </span>
                    <Link2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-indigo-400">
                      {selectedEdge.targetTitle}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      removeVisualLink(
                        selectedEdge.sourceTitle,
                        selectedEdge.targetTitle,
                      )
                    }
                    className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg flex items-center space-x-1 transition"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Delete Wikilink</span>
                  </button>
                  <button
                    onClick={() => setSelectedEdge(null)}
                    className="p-1 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* SVG GRAPH RENDERER */}
              <svg
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onClick={() => {
                  setSelectedEdge(null);
                  setSelectedCanvasNodeId(null);
                }}
              >
                <defs>
                  {/* Neon Glow Effects */}
                  <filter
                    id="glow-indigo"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite
                      in="SourceGraphic"
                      in2="blur"
                      operator="over"
                    />
                  </filter>
                  <filter
                    id="glow-cyan"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite
                      in="SourceGraphic"
                      in2="blur"
                      operator="over"
                    />
                  </filter>

                  {/* Marker Arrows for Directed Graph */}
                  <marker
                    id="arrow-local"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                  </marker>
                  <marker
                    id="arrow-wiki"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
                  </marker>
                </defs>

                <g
                  transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
                >
                  {/* RENDER GRAPH EDGES */}
                  {allGraphEdges.map((edge) => {
                    const sourcePos = nodePositions[edge.source];
                    const targetPos = nodePositions[edge.target];
                    if (!sourcePos || !targetPos) return null;

                    const isSelected =
                      selectedEdge?.source === edge.source &&
                      selectedEdge?.target === edge.target;

                    const isWikiEdge = edge.type === "wiki";

                    return (
                      <g key={edge.id} className="group">
                        <line
                          x1={sourcePos.x}
                          y1={sourcePos.y}
                          x2={targetPos.x}
                          y2={targetPos.y}
                          stroke={
                            isSelected
                              ? "#f43f5e"
                              : isWikiEdge
                                ? "#06b6d4"
                                : "#6366f1"
                          }
                          strokeWidth={isSelected ? 3 : isWikiEdge ? 1.5 : 2}
                          strokeDasharray={isWikiEdge ? "4 3" : "none"}
                          strokeOpacity={isSelected ? 1 : 0.6}
                          markerEnd={
                            isWikiEdge
                              ? "url(#arrow-wiki)"
                              : "url(#arrow-local)"
                          }
                          className="transition-all duration-150"
                        />
                        {/* Invisible thicker line for easy clicking */}
                        <line
                          x1={sourcePos.x}
                          y1={sourcePos.y}
                          x2={targetPos.x}
                          y2={targetPos.y}
                          stroke="transparent"
                          strokeWidth="12"
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEdge(edge);
                          }}
                        />
                      </g>
                    );
                  })}

                  {/* ACTIVE DRAG CONNECTION LINE (SHIFT+DRAG TO LINK) */}
                  {dragConnection && nodePositions[dragConnection.sourceId] && (
                    <line
                      x1={nodePositions[dragConnection.sourceId].x}
                      y1={nodePositions[dragConnection.sourceId].y}
                      x2={dragConnection.currentX}
                      y2={dragConnection.currentY}
                      stroke="#22d3ee"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      className="animate-pulse"
                    />
                  )}

                  {/* RENDER GRAPH NODES */}
                  {allGraphNodes.map((node) => {
                    const pos = nodePositions[node.id] || { x: 0, y: 0 };
                    const isActiveNode = node.id === activeNoteId;
                    const isSelectedCanvas = selectedCanvasNodeId === node.id;
                    const isWikipedia = node.type === "wikipedia";
                    const isMatch = isNodeMatchingFilter(node);

                    return (
                      <g
                        key={node.id}
                        data-node-id={node.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                        className={`cursor-pointer transition-opacity duration-300 ${
                          isMatch ? "opacity-100" : "opacity-15"
                        }`}
                      >
                        {/* Outer Glow Halo for Active / Wikipedia Nodes */}
                        {(isActiveNode || isSelectedCanvas) && (
                          <circle
                            r="26"
                            fill="none"
                            stroke={isWikipedia ? "#06b6d4" : "#818cf8"}
                            strokeWidth="2"
                            filter={
                              isWikipedia
                                ? "url(#glow-cyan)"
                                : "url(#glow-indigo)"
                            }
                            className="animate-ping opacity-30"
                          />
                        )}

                        {/* Base Node Circle */}
                        <circle
                          r={isWikipedia ? "18" : "20"}
                          fill={
                            isWikipedia
                              ? "#083344"
                              : isActiveNode
                                ? "#4f46e5"
                                : "#1e1b4b"
                          }
                          stroke={
                            isWikipedia
                              ? "#22d3ee"
                              : isActiveNode
                                ? "#a5b4fc"
                                : "#6366f1"
                          }
                          strokeWidth={isWikipedia ? "2.5" : "2"}
                          strokeDasharray={isWikipedia ? "3 2" : "none"}
                          className="hover:scale-110 transition-transform"
                        />

                        {/* Node Badge Icon */}
                        {isWikipedia ? (
                          <Globe className="w-4 h-4 text-cyan-400 -translate-x-2 -translate-y-2 pointer-events-none" />
                        ) : (
                          <FileText className="w-4 h-4 text-indigo-300 -translate-x-2 -translate-y-2 pointer-events-none" />
                        )}

                        {/* Node Label Text */}
                        <text
                          y="34"
                          textAnchor="middle"
                          fill={
                            isWikipedia
                              ? "#67e8f9"
                              : isActiveNode
                                ? "#ffffff"
                                : "#cbd5e1"
                          }
                          fontSize="11"
                          fontWeight={isActiveNode ? "700" : "500"}
                          className="pointer-events-none select-none drop-shadow-md"
                        >
                          {node.title}
                        </text>

                        {/* Wikipedia Node Import Action Button overlay */}
                        {isWikipedia && node.rawWikiObj && (
                          <g
                            transform="translate(14, -14)"
                            onClick={(e) => {
                              e.stopPropagation();
                              importWikipediaNode(node.rawWikiObj);
                            }}
                          >
                            <circle
                              r="8"
                              fill="#06b6d4"
                              className="hover:fill-cyan-300 transition"
                            />
                            <Plus className="w-3 h-3 text-slate-950 -translate-x-1.5 -translate-y-1.5 pointer-events-none font-bold" />
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          )}

          {/* 2. MARKDOWN EDITOR & LIVE PREVIEW VIEW */}
          {(viewMode === "editor" || viewMode === "split") && activeNote && (
            <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
              {/* Editor Sub-Header Toolbar */}
              <div className="h-10 border-b border-slate-800/80 bg-slate-900/50 px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {activeNote.path}
                  </span>
                  {activeNote.isWikiImport && (
                    <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded">
                      Wikipedia Import
                    </span>
                  )}
                </div>

                {/* Edit / Preview Tabs */}
                <div className="flex items-center space-x-2">
                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                    <button
                      onClick={() => setEditorTab("edit")}
                      className={`px-2.5 py-0.5 rounded flex items-center space-x-1 transition ${
                        editorTab === "edit"
                          ? "bg-indigo-600 text-white font-medium"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setEditorTab("preview")}
                      className={`px-2.5 py-0.5 rounded flex items-center space-x-1 transition ${
                        editorTab === "preview"
                          ? "bg-indigo-600 text-white font-medium"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Editor Workspace Main Area */}
              <div className="flex-1 flex flex-col overflow-hidden p-4">
                {editorTab === "edit" ? (
                  /* CODE EDIT MODE */
                  <textarea
                    value={activeNote.content}
                    onChange={(e) =>
                      updateNoteContent(activeNote.id, e.target.value)
                    }
                    placeholder="Type Markdown content here... Use [[Note Title]] to create wikilinks."
                    className="w-full flex-1 bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 resize-none leading-relaxed custom-scrollbar"
                  />
                ) : (
                  /* LIVE PREVIEW MODE WITH INTERACTIVE WIKILINK PILLS */
                  <div className="flex-1 bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 overflow-y-auto custom-scrollbar text-xs leading-relaxed space-y-4">
                    {/* Rendered Title */}
                    <h1 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-2 flex items-center justify-between">
                      <span>{activeNote.title}</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Updated{" "}
                        {new Date(activeNote.updatedAt).toLocaleTimeString()}
                      </span>
                    </h1>

                    {/* Markdown Content Parsing */}
                    <div className="prose prose-invert max-w-none space-y-3">
                      {activeNote.content
                        .split("\n\n")
                        .map((paragraph, pIdx) => {
                          // Header 1/2/3
                          if (paragraph.startsWith("# ")) {
                            return (
                              <h1
                                key={pIdx}
                                className="text-lg font-bold text-indigo-200"
                              >
                                {paragraph.replace("# ", "")}
                              </h1>
                            );
                          }
                          if (paragraph.startsWith("## ")) {
                            return (
                              <h2
                                key={pIdx}
                                className="text-base font-semibold text-slate-200"
                              >
                                {paragraph.replace("## ", "")}
                              </h2>
                            );
                          }
                          if (paragraph.startsWith("### ")) {
                            return (
                              <h3
                                key={pIdx}
                                className="text-sm font-semibold text-slate-300"
                              >
                                {paragraph.replace("### ", "")}
                              </h3>
                            );
                          }

                          // Parse paragraph for [[wikilinks]] and #tags
                          const parts = paragraph.split(
                            /(\[\[[^\]]+\]\]|#[a-zA-Z0-9_\-]+)/g,
                          );

                          return (
                            <p
                              key={pIdx}
                              className="text-slate-300 leading-relaxed"
                            >
                              {parts.map((part, i) => {
                                // Render Wikilink Pill
                                if (
                                  part.startsWith("[[") &&
                                  part.endsWith("]]")
                                ) {
                                  const linkTargetTitle = part.slice(2, -2);
                                  const targetNoteExists = notes.some(
                                    (n) =>
                                      n.title.toLowerCase() ===
                                      linkTargetTitle.toLowerCase(),
                                  );

                                  return (
                                    <span
                                      key={i}
                                      onClick={() => {
                                        const target = notes.find(
                                          (n) =>
                                            n.title.toLowerCase() ===
                                            linkTargetTitle.toLowerCase(),
                                        );
                                        if (target) {
                                          setActiveNoteId(target.id);
                                        } else {
                                          // Auto-create missing note
                                          createNewNote(linkTargetTitle);
                                        }
                                      }}
                                      className={`inline-flex items-center space-x-1 px-2 py-0.5 mx-0.5 rounded-md text-[11px] font-medium cursor-pointer border transition ${
                                        targetNoteExists
                                          ? "bg-indigo-950/80 text-indigo-300 border-indigo-700/60 hover:bg-indigo-900 hover:border-indigo-500"
                                          : "bg-amber-950/60 text-amber-300 border-amber-800/60 hover:bg-amber-900"
                                      }`}
                                    >
                                      <Link2 className="w-3 h-3 text-indigo-400" />
                                      <span>{linkTargetTitle}</span>
                                      {!targetNoteExists && (
                                        <Plus className="w-2.5 h-2.5 text-amber-400" />
                                      )}
                                    </span>
                                  );
                                }

                                // Render Tag Pill
                                if (part.startsWith("#")) {
                                  return (
                                    <span
                                      key={i}
                                      onClick={() =>
                                        setSelectedTag(part.slice(1))
                                      }
                                      className="inline-block px-1.5 py-0.2 mx-0.5 rounded bg-slate-800 text-slate-400 text-[10px] border border-slate-700 cursor-pointer hover:text-indigo-300"
                                    >
                                      {part}
                                    </span>
                                  );
                                }

                                return part;
                              })}
                            </p>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* BACKLINKS & LINKED REFERENCES PANEL */}
                <div className="mt-3 border-t border-slate-800/80 pt-3 bg-slate-900/30 p-3 rounded-xl shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Backlinks & Linked References</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {activeNoteBacklinks.length} mention(s)
                    </span>
                  </div>

                  {activeNoteBacklinks.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {activeNoteBacklinks.map((bNote) => (
                        <div
                          key={bNote.id}
                          onClick={() => setActiveNoteId(bNote.id)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-700/50 rounded-lg text-[11px] text-slate-300 cursor-pointer flex items-center space-x-1.5 transition"
                        >
                          <FileText className="w-3 h-3 text-indigo-400" />
                          <span>{bNote.title}</span>
                          <ArrowUpRight className="w-3 h-3 text-slate-500" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-600 italic">
                      No other notes link to [[{activeNote.title}]] yet. Use
                      Shift+Drag on canvas or write [[{activeNote.title}]] in
                      another note.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* COMMAND PALETTE / SEARCH OVERLAY MODAL */}
      {/* ========================================== */}
      {isCommandOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-3 border-b border-slate-800 flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search notes, wikilinks, or Wikipedia topics..."
                value={wikiSearchQuery}
                onChange={(e) => setWikiSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    searchWikipedia(wikiSearchQuery);
                    setIsCommandOpen(false);
                  }
                }}
                className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
              />
              <kbd className="text-[10px] bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded border border-slate-800">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1">
                Vault Notes
              </div>
              {notes
                .filter((n) =>
                  n.title.toLowerCase().includes(wikiSearchQuery.toLowerCase()),
                )
                .map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setActiveNoteId(n.id);
                      setIsCommandOpen(false);
                    }}
                    className="p-2 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-200 rounded-lg cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{n.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{n.path}</span>
                  </div>
                ))}

              <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1 pt-3">
                Actions
              </div>
              <div
                onClick={() => {
                  createNewNote();
                  setIsCommandOpen(false);
                }}
                className="p-2 hover:bg-indigo-600/20 text-indigo-300 rounded-lg cursor-pointer flex items-center space-x-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Markdown Note</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TOAST NOTIFICATIONS */}
      {/* ========================================== */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-2.5 rounded-xl border text-xs font-medium shadow-2xl flex items-center space-x-2 animate-in slide-in-from-bottom-5 ${
              toast.type === "success"
                ? "bg-slate-900 border-indigo-500/50 text-indigo-200"
                : toast.type === "error"
                  ? "bg-slate-900 border-red-500/50 text-red-200"
                  : "bg-slate-900 border-cyan-500/50 text-cyan-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
