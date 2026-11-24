import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Network,
  FileText,
  Search,
  Plus,
  Trash2,
  Globe,
  Link2,
  Unlink,
  Settings,
  RefreshCw,
  X,
  ChevronRight,
  ChevronDown,
  Tag,
  Eye,
  Edit3,
  ArrowUpRight,
  Sparkles,
  Folder,
  Download,
  Upload,
  Check,
  Zap,
  Layers,
  Split,
  Maximize2,
  HelpCircle,
  Clock,
  Compass,
  AlertCircle,
  Play,
  Pause,
  ArrowLeft,
  Sliders,
  PieChart,
  BookOpen,
  Copy,
  ExternalLink,
  BarChart2,
  List,
  Grid,
  Hash,
  Info,
  CheckSquare,
  Square,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Focus,
  Database,
  Link as LinkIcon,
  Share2,
  Code,
  LayoutGrid,
  Cpu,
  GitBranch,
  Lock,
  Shield,
  File,
  Keyboard,
  Menu,
  MoreHorizontal,
  Scissors,
  Pin,
  PinOff,
} from "lucide-react";
import {
  chooseVaultLocation,
  deleteNoteFromDB,
  getAllNotesFromDB,
  getVaultLocation,
  isDesktopBuild,
  saveAllNotesToDB,
  saveNoteToDB,
} from "./vaultDb";
import {
  createProject as createAccountProject,
  deleteProject as deleteAccountProject,
  deleteProjectNote,
  getProjectNotes,
  listProjects,
  renameProject as renameAccountProject,
  replaceProjectNotes,
  saveProjectNote,
} from "./projectApi";

// ==========================================
// PRE-POPULATED DEMO VAULT NOTES
// ==========================================
const INITIAL_DEMO_NOTES = [
  {
    id: "note-1",
    title: "Quantum Computing",
    path: "/Physics/Quantum Computing.md",
    content: `# Quantum Computing

Quantum computing harnesses the laws of quantum mechanics to solve problems too complex for classical computers.

> [!NOTE]
> Major breakthroughs rely on [[Superposition]] and [[Entanglement]] for exponential processing scale.

### Key Components:
- [x] Basic unit definition: [[Qubit]]
- [x] State manipulation via [[Superposition]]
- [ ] Error-correction using [[Graph Theory]]

\`\`\`python
# Simple Qubit State Representation
import numpy as np
qubit_zero = np.array([1, 0])
qubit_one = np.array([0, 1])
print("Quantum Baseline Loaded")
\`\`\`

Key architectural concepts rely heavily on [[Graph Theory]] for mapping qubit topologies.

See also: [[SynapseWiki Specs]].

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

> [!TIP]
> Unlike classical bits, qubits can exist in a linear combination of states.

### Key Behaviors:
- Leverages [[Superposition]] to exist in combinations of |0⟩ and |1⟩.
- Exhibits [[Entanglement]] when coupled with partner qubits.
- Forms the core hardware of [[Quantum Computing]].

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

A fundamental principle of quantum mechanics where a physical system exists in multiple states simultaneously until measured.

In [[Quantum Computing]], superposition allows a [[Qubit]] to process exponentially larger computational state spaces.

> [!WARNING]
> Wavefunction collapse occurs immediately upon state measurement.

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

Quantum entanglement is a phenomenon where particles become inextricably linked, such that measuring one instantly dictates the state of another.

Crucial for quantum teleportation and dense [[Qubit]] channels in [[Quantum Computing]].

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

SynapseWiki is a local-first, graph-first knowledge management web app featuring live physics graph simulations and Wikipedia research integration backed by browser IndexedDB storage.

### Core Features:
- [x] **Force Canvas**: Real-time force simulation layout engine with LOD grid
- [x] **IndexedDB Persistence**: Local storage browser persistence
- [x] **Wikipedia Engine**: Real extracts fetched directly from MediaWiki REST API
- [x] **Pre-Import Preview**: Preview Wikipedia articles in editor before saving

> [!IMPORTANT]
> All files remain strictly local-first with client-side privacy preserved in IndexedDB.

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

### Applications:
- Topology mapping for [[SynapseWiki Specs]]
- Qubit connectivity networks in [[Quantum Computing]]

\`\`\`javascript
// Graph Adjacency List Representation
const graph = {
  "Quantum Computing": ["Qubit", "Graph Theory"],
  "Qubit": ["Superposition", "Entanglement"]
};
\`\`\`

#math #algorithms #computer-science`,
    tags: ["math", "algorithms", "computer-science"],
    links: ["SynapseWiki Specs", "Quantum Computing"],
    isWikiImport: false,
    updatedAt: new Date().toISOString(),
  },
];

// Helper functions for regex parsing
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

const getNoteStats = (text = "") => {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const readTime = Math.max(1, Math.ceil(words / 200));
  return { words, chars, readTime };
};

// Wikipedia API Helpers
const fetchWikipediaSummary = async (title) => {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/\s+/g, "_"))}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || title,
      summary:
        data.extract ||
        data.description ||
        "No summary extract available from Wikipedia.",
      thumbnail: data.thumbnail?.source || null,
      url:
        data.content_urls?.desktop?.page ||
        `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    };
  } catch (e) {
    return null;
  }
};

const fetchWikipediaPageLinks = async (title) => {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      title,
    )}&prop=links&pllimit=10&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];
    if (!page || !page.links) return [];
    return page.links.map((l) => l.title);
  } catch (e) {
    return [];
  }
};

const fetchFullWikipediaArticleText = async (title) => {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(
      title,
    )}&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    if (!pageId || pageId === "-1") return null;
    let extract = pages[pageId].extract || "";

    extract = extract
      .replace(/^====\s*(.*?)\s*====$/gm, "#### $1")
      .replace(/^===\s*(.*?)\s*===$/gm, "### $1")
      .replace(/^==\s*(.*?)\s*==$/gm, "## $1");

    return extract;
  } catch (e) {
    console.error("Error fetching full article text:", e);
    return null;
  }
};

const fetchWikipediaArticleMedia = async (title) => {
  try {
    const cleanTitle = title.replace(/\s+/g, "_");
    const url = `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(cleanTitle)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.items || [];

    const images = [];
    const junkRegex =
      /(commons-logo|edit-clear|symbol|ambox|question_mark|p_vip|magnifying_glass|padlock|red_pencil|folder_hexagonal)/i;

    items.forEach((item) => {
      if (item.type === "image" && item.title && !junkRegex.test(item.title)) {
        let imgSrc = null;
        if (item.srcset && item.srcset.length > 0) {
          imgSrc = item.srcset[item.srcset.length - 1].src;
        } else if (item.srcset && item.srcset[0]) {
          imgSrc = item.srcset[0].src;
        }
        if (imgSrc) {
          if (imgSrc.startsWith("//")) imgSrc = "https:" + imgSrc;
          const captionText = item.caption?.text
            ? item.caption.text.replace(/<[^>]*>?/gm, "")
            : item.title.replace("File:", "").replace(/\.[^/.]+$/, "");
          images.push({
            url: imgSrc,
            caption: captionText || title,
            fileName: item.title,
          });
        }
      }
    });

    return images.slice(0, 8);
  } catch (e) {
    console.error("Error fetching article media:", e);
    return [];
  }
};

// ==========================================
// MAIN SYNAPSEWIKI REACT APPLICATION
// ==========================================
export default function App({ onExit, theme, onToggleTheme, session }) {
  // ------------------------------------------
  // CONSOLIDATED SINGLE STATE HOOK DECLARATIONS
  // ------------------------------------------
  const [notes, setNotes] = useState([]);
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [vaultLocation, setVaultLocation] = useState(
    isDesktopBuild ? null : "Browser IndexedDB",
  );
  const [vaultStorageError, setVaultStorageError] = useState(null);
  const [cloudProjects, setCloudProjects] = useState([]);
  const [cloudProjectId, setCloudProjectId] = useState(null);
  const [isProjectBusy, setIsProjectBusy] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [viewMode, setViewMode] = useState("split"); // 'canvas' | 'split' | 'editor'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [editorTab, setEditorTab] = useState("preview"); // 'edit' | 'preview'
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  // Wikipedia Search & Candidate Node State
  const [wikiSearchQuery, setWikiSearchQuery] = useState("");
  const [wikiSearchResults, setWikiSearchResults] = useState([]);
  const [isWikiSearching, setIsWikiSearching] = useState(false);
  const [wikiNodes, setWikiNodes] = useState([]);
  const [previewingWikiNode, setPreviewingWikiNode] = useState(null);

  // Modals & Panels
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isExtendingWiki, setIsExtendingWiki] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  // Physics Controls
  const [isPhysicsRunning, setIsPhysicsRunning] = useState(true);
  const [repulsionStrength, setRepulsionStrength] = useState(1200);
  const [linkDistance, setLinkDistance] = useState(130);
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Canvas Viewport & Node Selection State
  const [selectedCanvasNodeId, setSelectedCanvasNodeId] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [dragConnection, setDragConnection] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState(null);

  // Autocomplete
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState("");
  const [autocompletePos, setAutocompletePos] = useState({ top: 0, left: 0 });

  // Physics Positions State
  const [nodePhysicsState, setNodePhysicsState] = useState({});

  // ------------------------------------------
  // REFS
  // ------------------------------------------
  const panStartRef = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const editorRef = useRef(null);
  const requestRef = useRef(null);
  const exportVaultRef = useRef(null);
  const toggleGraphRef = useRef(null);

  // Toast Dispatcher
  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const hasAccountStorage = !isDesktopBuild && Boolean(session?.user?.id);

  // Initialize the selected storage adapter on mount
  useEffect(() => {
    let cancelled = false;
    const loadVault = async () => {
      try {
        const location = await getVaultLocation();
        setVaultLocation(location);
        if (isDesktopBuild && !location) {
          setNotes([]);
          setIsDbInitialized(true);
          return;
        }

        if (hasAccountStorage) {
          setVaultLocation("Cloudflare account");
          let localNotes = [];
          try {
            localNotes = await getAllNotesFromDB();
          } catch (error) {
            console.error("Could not read the local vault for account import:", error);
          }

          let projects = await listProjects();
          if (projects.length === 0) {
            const project = await createAccountProject("My SynapseWiki");
            const notesToImport =
              localNotes.length > 0 ? localNotes : INITIAL_DEMO_NOTES;
            await replaceProjectNotes(project.id, notesToImport);
            projects = [{ ...project, noteCount: notesToImport.length }];
          }

          let savedProjectId = null;
          try {
            savedProjectId = localStorage.getItem(
              `synapsewiki.project.${session.user.id}`,
            );
          } catch (error) {
            console.error("Could not read the selected account project:", error);
          }
          const selectedProject =
            projects.find((project) => project.id === savedProjectId) ||
            projects[0];
          let accountNotes = await getProjectNotes(selectedProject.id);
          if (accountNotes.length === 0) {
            const starterNote = {
              id: `note-${crypto.randomUUID()}`,
              title: "Welcome",
              path: "/Welcome.md",
              content:
                "# Welcome\n\nThis is your account-backed project. Create notes and they will be saved to your account.",
              tags: [],
              links: [],
              isWikiImport: false,
              updatedAt: new Date().toISOString(),
            };
            await saveProjectNote(selectedProject.id, starterNote);
            accountNotes = [starterNote];
          }

          if (cancelled) return;
          setCloudProjects(projects);
          setCloudProjectId(selectedProject.id);
          try {
            localStorage.setItem(
              `synapsewiki.project.${session.user.id}`,
              selectedProject.id,
            );
          } catch (error) {
            console.error("Could not save the selected account project:", error);
          }
          setNotes(accountNotes);
          setActiveNoteId(accountNotes[0]?.id || null);
          setIsDbInitialized(true);
          return;
        }

        const storedNotes = await getAllNotesFromDB();
        if (storedNotes.length === 0) {
          await saveAllNotesToDB(INITIAL_DEMO_NOTES);
          setNotes(INITIAL_DEMO_NOTES);
          setActiveNoteId(INITIAL_DEMO_NOTES[0].id);
        } else {
          setNotes(storedNotes);
          setActiveNoteId(storedNotes[0].id);
        }
        setIsDbInitialized(true);
      } catch (err) {
        console.error("Vault storage initialization error:", err);
        if (hasAccountStorage) {
          setVaultStorageError(err.message || "The account project could not be loaded.");
          setNotes([]);
          setActiveNoteId(null);
          setIsDbInitialized(true);
          addToast("Unable to load your cloud project. Please retry.", "error");
        } else if (isDesktopBuild) {
          setVaultStorageError(err.message || "The selected vault folder is unavailable.");
          setVaultLocation(null);
          setNotes([]);
          setActiveNoteId(null);
          setIsDbInitialized(true);
          addToast("Vault folder access expired. Choose the folder again.", "warning");
        } else {
          setNotes(INITIAL_DEMO_NOTES);
          setActiveNoteId(INITIAL_DEMO_NOTES[0].id);
          setIsDbInitialized(true);
          addToast("IndexedDB unavailable. Using local fallback.", "warning");
        }
      }
    };
    loadVault();
    return () => {
      cancelled = true;
    };
  }, [addToast, hasAccountStorage, session?.user?.id]);

  const persistNote = async (note) => {
    if (hasAccountStorage) {
      if (!cloudProjectId) throw new Error("No account project is selected.");
      return saveProjectNote(cloudProjectId, note);
    }
    return saveNoteToDB(note);
  };

  const persistAllNotes = async (nextNotes) => {
    if (hasAccountStorage) {
      if (!cloudProjectId) throw new Error("No account project is selected.");
      return replaceProjectNotes(cloudProjectId, nextNotes);
    }
    return saveAllNotesToDB(nextNotes);
  };

  const removePersistedNote = async (noteId) => {
    if (hasAccountStorage) {
      if (!cloudProjectId) throw new Error("No account project is selected.");
      return deleteProjectNote(cloudProjectId, noteId);
    }
    return deleteNoteFromDB(noteId);
  };

  const rememberSelectedProject = (projectId) => {
    if (!session?.user?.id) return;
    try {
      localStorage.setItem(
        `synapsewiki.project.${session.user.id}`,
        projectId,
      );
    } catch (error) {
      console.error("Could not save the selected account project:", error);
    }
  };

  const selectAccountProject = async (projectId) => {
    setIsProjectBusy(true);
    try {
      const projectNotes = await getProjectNotes(projectId);
      if (projectNotes.length === 0) {
        const starterNote = {
          id: `note-${crypto.randomUUID()}`,
          title: "Welcome",
          path: "/Welcome.md",
          content:
            "# Welcome\n\nThis is your account-backed project. Create notes and they will be saved to your account.",
          tags: [],
          links: [],
          isWikiImport: false,
          updatedAt: new Date().toISOString(),
        };
        await saveProjectNote(projectId, starterNote);
        projectNotes.push(starterNote);
      }
      setCloudProjectId(projectId);
      rememberSelectedProject(projectId);
      setNotes(projectNotes);
      setActiveNoteId(projectNotes[0]?.id || null);
      setSearchFilter("");
      setSelectedTag(null);
    } catch (error) {
      console.error("Account project switch failed:", error);
      addToast(error.message || "Could not open that project.", "error");
    } finally {
      setIsProjectBusy(false);
    }
  };

  const createAccountWorkspace = async () => {
    const name = window.prompt("Name your new project");
    if (!name?.trim()) return;

    setIsProjectBusy(true);
    try {
      const project = await createAccountProject(name.trim());
      const starterNote = {
        id: `note-${crypto.randomUUID()}`,
        title: "Welcome",
        path: "/Welcome.md",
        content:
          "# Welcome\n\nThis is your account-backed project. Create notes and they will be saved to your account.",
        tags: [],
        links: [],
        isWikiImport: false,
        updatedAt: new Date().toISOString(),
      };
      await saveProjectNote(project.id, starterNote);
      setCloudProjects((projects) => [project, ...projects]);
      setCloudProjectId(project.id);
      rememberSelectedProject(project.id);
      setNotes([starterNote]);
      setActiveNoteId(starterNote.id);
      setSearchFilter("");
      setSelectedTag(null);
      addToast(`Created project "${project.name}"`, "success");
    } catch (error) {
      console.error("Account project creation failed:", error);
      addToast(error.message || "Could not create that project.", "error");
    } finally {
      setIsProjectBusy(false);
    }
  };

  const renameAccountWorkspace = async () => {
    const currentProject = cloudProjects.find(
      (project) => project.id === cloudProjectId,
    );
    if (!currentProject) return;
    const name = window.prompt("Rename project", currentProject.name);
    if (!name?.trim() || name.trim() === currentProject.name) return;

    setIsProjectBusy(true);
    try {
      const updatedProject = await renameAccountProject(
        currentProject.id,
        name.trim(),
      );
      setCloudProjects((projects) =>
        projects.map((project) =>
          project.id === updatedProject.id
            ? { ...project, ...updatedProject }
            : project,
        ),
      );
      addToast("Project renamed.", "success");
    } catch (error) {
      console.error("Account project rename failed:", error);
      addToast(error.message || "Could not rename that project.", "error");
    } finally {
      setIsProjectBusy(false);
    }
  };

  const deleteAccountWorkspace = async () => {
    const currentProject = cloudProjects.find(
      (project) => project.id === cloudProjectId,
    );
    if (!currentProject) return;
    if (cloudProjects.length <= 1) {
      addToast("Keep at least one account project.", "warning");
      return;
    }
    if (
      !window.confirm(
        `Delete "${currentProject.name}" and all of its cloud notes? This cannot be undone.`,
      )
    ) {
      return;
    }

    setIsProjectBusy(true);
    try {
      await deleteAccountProject(currentProject.id);
      const remainingProjects = cloudProjects.filter(
        (project) => project.id !== currentProject.id,
      );
      setCloudProjects(remainingProjects);
      const nextProject = remainingProjects[0];
      await selectAccountProject(nextProject.id);
      addToast(`Deleted project "${currentProject.name}".`, "success");
    } catch (error) {
      console.error("Account project deletion failed:", error);
      addToast(error.message || "Could not delete that project.", "error");
    } finally {
      setIsProjectBusy(false);
    }
  };

  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeNoteId) || notes[0];
  }, [notes, activeNoteId]);

  // Candidate Ghost Node Pruning Functions
  const pruneGhostNode = useCallback(
    (nodeId) => {
      setWikiNodes((prev) => {
        const target = prev.find((w) => w.id === nodeId);
        if (target) {
          addToast(`Pruned candidate node "${target.title}"`, "info");
        }
        return prev.filter((w) => w.id !== nodeId);
      });
      if (selectedCanvasNodeId === nodeId) {
        setSelectedCanvasNodeId(null);
      }
      if (previewingWikiNode && previewingWikiNode.id === nodeId) {
        setPreviewingWikiNode(null);
      }
    },
    [selectedCanvasNodeId, previewingWikiNode, addToast],
  );

  const pruneAllGhostNodes = useCallback(() => {
    const count = wikiNodes.length;
    if (count === 0) {
      addToast("No candidate ghost nodes to prune", "info");
      return;
    }
    setWikiNodes([]);
    setSelectedCanvasNodeId(null);
    setPreviewingWikiNode(null);
    addToast(
      `Pruned ${count} unimported candidate node(s) from canvas`,
      "success",
    );
  }, [wikiNodes, addToast]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isEditingText =
        ["INPUT", "TEXTAREA"].includes(e.target.tagName) ||
        e.target.isContentEditable;

      // Cmd/Ctrl + K: Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
        return;
      }

      // Cmd/Ctrl + E: Toggle View Mode
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setViewMode((prev) =>
          prev === "split" ? "editor" : prev === "editor" ? "canvas" : "split",
        );
        return;
      }

      // Escape: Close overlays / deselect
      if (e.key === "Escape") {
        setIsCommandOpen(false);
        setIsAnalyticsOpen(false);
        setIsShortcutsOpen(false);
        setMobileSidebarOpen(false);
        setMobileToolsOpen(false);
        setLightboxImage(null);
        setSelectedCanvasNodeId(null);
        setSelectedEdge(null);
        setShowAutocomplete(false);
        return;
      }

      if (!isEditingText) {
        // Space: Toggle Physics Simulation
        if (e.key === " " || e.code === "Space") {
          e.preventDefault();
          setIsPhysicsRunning((prev) => !prev);
          return;
        }

        // Delete / Backspace: Delete candidate ghost node
        if (e.key === "Delete" || e.key === "Backspace") {
          if (selectedCanvasNodeId) {
            const isGhost = wikiNodes.some(
              (w) => w.id === selectedCanvasNodeId,
            );
            if (isGhost) {
              e.preventDefault();
              pruneGhostNode(selectedCanvasNodeId);
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCanvasNodeId, wikiNodes, pruneGhostNode]);

  // Vault JSON Export & Import
  const exportVaultJSON = useCallback(() => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `SynapseWiki_Vault_Backup_${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast("Exported vault backup as JSON file", "success");
  }, [notes, addToast]);

  const toggleGraph = useCallback(() => {
    setViewMode((current) => (current === "canvas" ? "split" : "canvas"));
  }, []);

  useEffect(() => {
    exportVaultRef.current = exportVaultJSON;
    toggleGraphRef.current = toggleGraph;
  }, [exportVaultJSON, toggleGraph]);

  useEffect(() => {
    if (!isDesktopBuild) return undefined;

    let cancelled = false;
    let disposeMenu;
    const installMenu = async () => {
      try {
        const { installNativeMenu } = await import("./nativeMenu");
        const dispose = await installNativeMenu({
          onExportVault: () => exportVaultRef.current?.(),
          onToggleGraph: () => toggleGraphRef.current?.(),
        });
        if (cancelled) {
          await dispose();
        } else {
          disposeMenu = dispose;
        }
      } catch (err) {
        console.error("Native menu initialization error:", err);
        addToast("Unable to initialize native application menus.", "error");
      }
    };

    installMenu();
    return () => {
      cancelled = true;
      if (disposeMenu) {
        disposeMenu().catch((err) =>
          console.error("Native menu cleanup error:", err),
        );
      }
    };
  }, [addToast]);

  const handleChooseVaultLocation = async () => {
    try {
      const location = await chooseVaultLocation();
      if (!location) return;

      setVaultLocation(location);
      setVaultStorageError(null);
      const storedNotes = await getAllNotesFromDB();
      if (storedNotes.length === 0) {
        await saveAllNotesToDB(INITIAL_DEMO_NOTES);
        setNotes(INITIAL_DEMO_NOTES);
        setActiveNoteId(INITIAL_DEMO_NOTES[0].id);
      } else {
        setNotes(storedNotes);
        setActiveNoteId(storedNotes[0].id);
      }
      setIsDbInitialized(true);
      addToast("Connected to the selected Markdown vault folder.", "success");
    } catch (err) {
      console.error("Vault folder selection error:", err);
      setVaultLocation(null);
      setVaultStorageError(err.message || "The selected folder could not be opened.");
      addToast("Unable to open that folder. Choose another vault folder.", "error");
    }
  };

  const importVaultJSON = (event) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = async (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!Array.isArray(parsed)) {
            throw new Error("The backup must contain an array of notes.");
          }
          await persistAllNotes(parsed);
          setNotes(parsed);
          if (parsed.length > 0) setActiveNoteId(parsed[0].id);
          addToast(
            `Successfully imported ${parsed.length} notes into the vault`,
            "success",
          );
        } catch (err) {
          console.error("Vault import error:", err);
          addToast(
            err instanceof SyntaxError
              ? "Invalid JSON backup file"
              : "Could not import the vault backup",
            "error",
          );
        }
      };
    }
  };

  const exportCurrentNote = () => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeNote.title}.md`;
    link.click();
    URL.revokeObjectURL(url);
    addToast(`Exported "${activeNote.title}.md"`, "success");
  };

  // Wikipedia Search API
  const searchWikipedia = async (query) => {
    if (!query.trim()) return;
    setIsWikiSearching(true);
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query,
      )}&srlimit=8&utf8=&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (!searchData.query || !searchData.query.search.length) {
        addToast(`No Wikipedia results found for "${query}"`, "warning");
        setWikiSearchResults([]);
        setIsWikiSearching(false);
        return;
      }

      const results = searchData.query.search.map((item) => ({
        pageid: item.pageid,
        title: item.title,
        snippet: item.snippet.replace(/<[^>]*>?/gm, ""),
        wordcount: item.wordcount,
      }));

      setWikiSearchResults(results);
      addToast(
        `Found ${results.length} Wikipedia articles for "${query}"`,
        "success",
      );
    } catch (err) {
      console.error("Wikipedia API Error:", err);
      addToast("Failed to connect to MediaWiki API", "error");
    } finally {
      setIsWikiSearching(false);
    }
  };

  const spawnWikipediaCandidateNode = async (
    title,
    autoExpandLinks = false,
  ) => {
    setIsWikiSearching(true);
    try {
      const summary = await fetchWikipediaSummary(title);
      if (!summary) {
        addToast(`Could not load extract for "${title}"`, "error");
        return;
      }

      let connectedLinks = [];
      if (autoExpandLinks) {
        const rawLinks = await fetchWikipediaPageLinks(title);
        connectedLinks = rawLinks.slice(0, 5);
      }

      const newWikiNode = {
        id: `wiki-${title.replace(/\s+/g, "_")}`,
        title: summary.title,
        summary: summary.summary,
        thumbnail: summary.thumbnail,
        links: connectedLinks,
        isWikiNode: true,
        url: summary.url,
      };

      setWikiNodes((prev) => {
        if (prev.some((w) => w.title.toLowerCase() === title.toLowerCase()))
          return prev;
        return [...prev, newWikiNode];
      });

      setPreviewingWikiNode(newWikiNode);
      addToast(`Added "${title}" candidate node to canvas`, "info");
    } catch (err) {
      addToast("Error adding candidate node", "error");
    } finally {
      setIsWikiSearching(false);
    }
  };

  const fetchWikipediaArticleNetwork = async (title) => {
    setIsWikiSearching(true);
    try {
      const mainSummary = await fetchWikipediaSummary(title);
      if (!mainSummary) {
        addToast(`Could not load Wikipedia article for "${title}"`, "error");
        return;
      }

      const rawLinks = await fetchWikipediaPageLinks(title);
      const topLinkTitles = rawLinks.slice(0, 5);

      const subSummaries = await Promise.allSettled(
        topLinkTitles.map((t) => fetchWikipediaSummary(t)),
      );

      const subWikiNodes = subSummaries.map((result, idx) => {
        const subTitle = topLinkTitles[idx];
        const summaryData =
          result.status === "fulfilled" && result.value ? result.value : null;
        return {
          id: `wiki-${subTitle.replace(/\s+/g, "_")}`,
          title: subTitle,
          summary:
            summaryData?.summary || `Wikipedia article related to ${title}.`,
          thumbnail: summaryData?.thumbnail || null,
          links: [title],
          isWikiNode: true,
          parentTitle: title,
          url:
            summaryData?.url ||
            `https://en.wikipedia.org/wiki/${encodeURIComponent(subTitle)}`,
        };
      });

      const mainWikiNode = {
        id: `wiki-${title.replace(/\s+/g, "_")}`,
        title: mainSummary.title,
        summary: mainSummary.summary,
        thumbnail: mainSummary.thumbnail,
        links: topLinkTitles,
        isWikiNode: true,
        url: mainSummary.url,
      };

      setPreviewingWikiNode(mainWikiNode);

      setWikiNodes((prev) => {
        const existingTitles = new Set(prev.map((n) => n.title.toLowerCase()));
        const filteredNew = [mainWikiNode, ...subWikiNodes].filter(
          (n) => !existingTitles.has(n.title.toLowerCase()),
        );
        return [...prev, ...filteredNew];
      });

      addToast(`Expanded "${title}" 1-hop network on canvas`, "success");
    } catch (err) {
      console.error(err);
      addToast("Error fetching Wikipedia network", "error");
    } finally {
      setIsWikiSearching(false);
    }
  };

  const selectWikiNodeForPreview = async (node) => {
    if (!node.summary || node.summary.includes("related to")) {
      addToast(`Fetching Wikipedia extract for "${node.title}"...`, "info");
      const freshSummary = await fetchWikipediaSummary(node.title);
      if (freshSummary) {
        const updated = {
          ...node,
          summary: freshSummary.summary,
          thumbnail: freshSummary.thumbnail || node.thumbnail,
          url: freshSummary.url || node.url,
        };
        setPreviewingWikiNode(updated);
        setWikiNodes((prev) =>
          prev.map((w) => (w.id === node.id ? updated : w)),
        );
        return;
      }
    }
    setPreviewingWikiNode(node);
  };

  const importWikipediaNode = async (wikiNode) => {
    const existing = notes.find(
      (n) => n.title.toLowerCase() === wikiNode.title.toLowerCase(),
    );

    if (existing) {
      addToast(`"${wikiNode.title}" is already in your vault`, "info");
      setActiveNoteId(existing.id);
      setPreviewingWikiNode(null);
      return;
    }

    const wikilinkMatches = (wikiNode.links || [])
      .map((l) => `[[${l}]]`)
      .join(", ");

    const newNoteContent = `# ${wikiNode.title}\n\n*Imported from Wikipedia research graph.*\n\n> [!NOTE]\n> ${
      wikiNode.summary || "Summary unavailable."
    }\n\n### Connected Wikipedia Concepts:\n${
      wikilinkMatches || "None"
    }\n\n[Open on Wikipedia](${wikiNode.url || "#"})\n\n#wikipedia #research #imported`;

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

    try {
      await persistNote(newNote);
    } catch (err) {
      console.error("Wikipedia note save error:", err);
      addToast(`Failed to save "${wikiNode.title}"`, "error");
      return;
    }

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    setWikiNodes((prev) =>
      prev.filter(
        (w) => w.title.toLowerCase() !== wikiNode.title.toLowerCase(),
      ),
    );
    setActiveNoteId(newNote.id);
    setPreviewingWikiNode(null);
    addToast(
      `Imported "${wikiNode.title}" into the local vault`,
      "success",
    );
  };

  const extendWikipediaArticle = async (targetNode) => {
    if (!targetNode || !targetNode.title) return;
    setIsExtendingWiki(true);
    addToast(
      `Fetching full article & media for "${targetNode.title}"...`,
      "info",
    );

    try {
      const [fullText, mediaList] = await Promise.all([
        fetchFullWikipediaArticleText(targetNode.title),
        fetchWikipediaArticleMedia(targetNode.title),
      ]);

      if (!fullText) {
        addToast(
          `Could not fetch full article text for "${targetNode.title}"`,
          "warning",
        );
        setIsExtendingWiki(false);
        return;
      }

      let galleryMarkdown = "";
      if (mediaList.length > 0) {
        galleryMarkdown =
          `\n\n### Article Media & Gallery (${mediaList.length} Images)\n` +
          mediaList
            .map(
              (img) => `![${img.caption.replace(/[\n\r]/g, " ")}](${img.url})`,
            )
            .join("\n\n");
      }

      const wikilinkMatches = (targetNode.links || [])
        .map((l) => `[[${l}]]`)
        .join(", ");

      const extendedContent = `# ${targetNode.title}\n\n*Full Wikipedia Article & Media Import.*\n\n> [!NOTE]\n> ${
        targetNode.summary || "Summary unavailable."
      }\n\n${fullText}${galleryMarkdown}\n\n### Connected Wikipedia Concepts:\n${
        wikilinkMatches || "None"
      }\n\n[Open on Wikipedia](${targetNode.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(targetNode.title)}`})\n\n#wikipedia #research #extended #full-article`;

      const existingIndex = notes.findIndex(
        (n) => n.title.toLowerCase() === targetNode.title.toLowerCase(),
      );

      if (existingIndex !== -1) {
        const existingNote = notes[existingIndex];
        const updatedNote = {
          ...existingNote,
          content: extendedContent,
          tags: extractTags(extendedContent),
          links: extractWikilinks(extendedContent),
          updatedAt: new Date().toISOString(),
        };
        await persistNote(updatedNote);
        const newNotes = [...notes];
        newNotes[existingIndex] = updatedNote;
        setNotes(newNotes);
        setActiveNoteId(updatedNote.id);
        addToast(
          `Extended "${targetNode.title}" with full text & ${mediaList.length} images`,
          "success",
        );
      } else {
        const newNote = {
          id: `note-${Date.now()}`,
          title: targetNode.title,
          path: `/Wikipedia/${targetNode.title}.md`,
          content: extendedContent,
          tags: extractTags(extendedContent),
          links: extractWikilinks(extendedContent),
          isWikiImport: true,
          updatedAt: new Date().toISOString(),
        };
        await persistNote(newNote);
        setNotes((prev) => [...prev, newNote]);
        setActiveNoteId(newNote.id);
        setPreviewingWikiNode(null);
        addToast(
          `Imported & Extended "${targetNode.title}" with full text & ${mediaList.length} images`,
          "success",
        );
      }
    } catch (err) {
      console.error("Extension error:", err);
      addToast("Failed to extend Wikipedia article", "error");
    } finally {
      setIsExtendingWiki(false);
    }
  };

  // Note CRUD Operations
  const updateNoteContent = async (noteId, newContent) => {
    const note = notes.find((item) => item.id === noteId);
    if (!note) return;

    const updated = {
      ...note,
      content: newContent,
      tags: extractTags(newContent),
      links: extractWikilinks(newContent),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prevNotes) =>
      prevNotes.map((item) => (item.id === noteId ? updated : item)),
    );
    try {
      await persistNote(updated);
    } catch (err) {
      console.error("Note save error:", err);
      addToast(`Failed to save "${note.title}"`, "error");
    }
  };

  const handleEditorChange = (e) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    updateNoteContent(activeNote.id, text);

    const textBeforeCursor = text.slice(0, cursorPos);
    const match = textBeforeCursor.match(/\[\[([^\]]*)$/);

    if (match) {
      setAutocompleteQuery(match[1]);
      setShowAutocomplete(true);
      setAutocompletePos({
        top: Math.min(220, (cursorPos / text.length) * 300 + 40),
        left: 40,
      });
    } else {
      setShowAutocomplete(false);
    }
  };

  const insertWikilinkFromAutocomplete = (targetTitle) => {
    if (!activeNote || !editorRef.current) return;
    const text = activeNote.content;
    const cursorPos = editorRef.current.selectionStart;
    const textBefore = text.slice(0, cursorPos);
    const textAfter = text.slice(cursorPos);

    const lastMatchIndex = textBefore.lastIndexOf("[[");
    if (lastMatchIndex !== -1) {
      const newContent =
        textBefore.slice(0, lastMatchIndex) + `[[${targetTitle}]]` + textAfter;
      updateNoteContent(activeNote.id, newContent);
    }
    setShowAutocomplete(false);
  };

  const createNewNote = async (title = "Untitled Note") => {
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
      content: `# ${finalTitle}\n\nStart typing note content here... Create links to other concepts using [[wikilinks]].\n\n#notes`,
      tags: ["notes"],
      links: [],
      isWikiImport: false,
      updatedAt: new Date().toISOString(),
    };

    try {
      await persistNote(newNote);
    } catch (err) {
      console.error("Note creation error:", err);
      addToast(`Failed to save "${finalTitle}"`, "error");
      return;
    }

    const updated = [...notes, newNote];
    setNotes(updated);
    setActiveNoteId(newNote.id);
    setPreviewingWikiNode(null);
    addToast(`Created note: ${finalTitle}`, "success");
  };

  const deleteNote = async (noteId) => {
    const target = notes.find((n) => n.id === noteId);
    if (!target) return;

    if (notes.length <= 1) {
      addToast("Cannot delete the only note in the vault", "warning");
      return;
    }

    try {
      await removePersistedNote(noteId);
    } catch (err) {
      console.error("Note deletion error:", err);
      addToast(`Failed to delete "${target.title}"`, "error");
      return;
    }

    const remaining = notes.filter((n) => n.id !== noteId);
    setNotes(remaining);
    if (activeNoteId === noteId) {
      setActiveNoteId(remaining[0].id);
    }
    addToast(`Deleted note: ${target.title}`, "info");
  };

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

    const wikilinkStr = `[[${targetTitle}]]`;
    if (sourceNote.content.includes(wikilinkStr)) {
      addToast(
        `Link to [[${targetTitle}]] already exists in ${sourceTitle}`,
        "info",
      );
      return;
    }

    const updatedContent = `${sourceNote.content}\n\nRelated: ${wikilinkStr}`;
    updateNoteContent(sourceNote.id, updatedContent);
    addToast(`Added [[${targetTitle}]] to ${sourceNote.title}`, "success");
  };

  const removeVisualLink = (sourceTitle, targetTitle) => {
    const sourceNote = notes.find(
      (n) => n.title.toLowerCase() === sourceTitle.toLowerCase(),
    );

    if (!sourceNote) return;

    const regex = new RegExp(
      `\\[\\[${escapeRegExp(targetTitle)}(?:\\|[^\\]]+)?\\]\\]`,
      "gi",
    );
    const updatedContent = sourceNote.content.replace(regex, "").trim();

    updateNoteContent(sourceNote.id, updatedContent);
    setSelectedEdge(null);
    addToast(`Removed [[${targetTitle}]] from ${sourceNote.title}`, "info");
  };

  const resetDemoVault = async () => {
    if (
      hasAccountStorage &&
      !window.confirm(
        "Reset this account project to the demo notes? This replaces its current notes.",
      )
    ) {
      return;
    }
    try {
      await persistAllNotes(INITIAL_DEMO_NOTES);
    } catch (err) {
      console.error("Vault reset error:", err);
      addToast("Failed to reset the vault", "error");
      return;
    }
    setNotes(INITIAL_DEMO_NOTES);
    setActiveNoteId("note-1");
    setWikiNodes([]);
    setPreviewingWikiNode(null);
    addToast("Reset vault to initial demo state", "success");
  };

  // Analytics Computation
  const analytics = useMemo(() => {
    const totalNotes = notes.length;
    let totalLinks = 0;
    const degreeMap = {};

    notes.forEach((n) => {
      degreeMap[n.title] = (degreeMap[n.title] || 0) + (n.links || []).length;
      totalLinks += (n.links || []).length;
      (n.links || []).forEach((l) => {
        degreeMap[l] = (degreeMap[l] || 0) + 1;
      });
    });

    const sortedHubs = Object.entries(degreeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const orphans = notes.filter((n) => {
      const isSource = (n.links || []).length > 0;
      const isTarget = notes.some((other) =>
        (other.links || []).some(
          (l) => l.toLowerCase() === n.title.toLowerCase(),
        ),
      );
      return !isSource && !isTarget;
    });

    const vaultDensity =
      totalNotes > 1
        ? (totalLinks / (totalNotes * (totalNotes - 1))).toFixed(3)
        : "0";

    return { totalNotes, totalLinks, sortedHubs, orphans, vaultDensity };
  }, [notes]);

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

  const unlinkedReferences = useMemo(() => {
    if (!activeNote) return [];
    const titleRegex = new RegExp(
      `\\b${escapeRegExp(activeNote.title)}\\b`,
      "gi",
    );
    return notes.filter((n) => {
      if (n.id === activeNote.id) return false;
      const alreadyLinked = (n.links || []).some(
        (l) => l.toLowerCase() === activeNote.title.toLowerCase(),
      );
      return !alreadyLinked && titleRegex.test(n.content);
    });
  }, [notes, activeNote]);

  const allVaultTags = useMemo(() => {
    const tagCounts = {};
    notes.forEach((n) => {
      (n.tags || []).forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });
    return Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  // Unified Graph Nodes & Edges
  const allGraphNodes = useMemo(() => {
    const localNodes = notes.map((n) => {
      const outgoing = (n.links || []).length;
      const incoming = notes.filter((other) =>
        (other.links || []).some(
          (l) => l.toLowerCase() === n.title.toLowerCase(),
        ),
      ).length;
      const degree = outgoing + incoming;

      return {
        id: n.id,
        title: n.title,
        type: degree === 0 ? "orphan" : "local",
        tags: n.tags,
        isWikiImport: n.isWikiImport,
        links: n.links || [],
        degree: degree,
        isWikiNode: false,
      };
    });

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
        degree: (w.links || []).length + 1,
        isWikiNode: true,
        rawWikiObj: w,
      }));

    return [...localNodes, ...externalWikiNodes];
  }, [notes, wikiNodes]);

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
              sourceNode.isWikiNode || targetId.startsWith("wiki-")
                ? "wiki"
                : "local",
          });
        }
      });
    });

    return edges;
  }, [allGraphNodes]);

  // Initial Physics Setup
  useEffect(() => {
    setNodePhysicsState((prev) => {
      const updated = { ...prev };
      const centerX = 400;
      const centerY = 350;
      const radius = 220;

      allGraphNodes.forEach((node, index) => {
        if (!updated[node.id]) {
          const angle =
            (index / Math.max(1, allGraphNodes.length)) * 2 * Math.PI;
          updated[node.id] = {
            x: centerX + radius * Math.cos(angle) + (Math.random() * 40 - 20),
            y: centerY + radius * Math.sin(angle) + (Math.random() * 40 - 20),
            vx: 0,
            vy: 0,
            pinned: false,
          };
        }
      });
      return updated;
    });
  }, [allGraphNodes]);

  // Physics Animation Loop
  const runPhysicsStep = useCallback(() => {
    if (!isPhysicsRunning) return;

    setNodePhysicsState((prevPos) => {
      const keys = Object.keys(prevPos);
      if (keys.length === 0) return prevPos;

      const nextState = {};
      keys.forEach((k) => {
        nextState[k] = { ...prevPos[k] };
      });

      const centerX = 400;
      const centerY = 350;

      // 1. Repulsion
      for (let i = 0; i < keys.length; i++) {
        const idA = keys[i];
        const nodeA = nextState[idA];
        if (!nodeA) continue;

        for (let j = i + 1; j < keys.length; j++) {
          const idB = keys[j];
          const nodeB = nextState[idB];
          if (!nodeB) continue;

          let dx = nodeB.x - nodeA.x;
          let dy = nodeB.y - nodeA.y;
          let distSq = dx * dx + dy * dy + 0.1;
          let dist = Math.sqrt(distSq);

          if (dist < 400) {
            let force = (repulsionStrength / distSq) * 1.5;
            let fx = (dx / dist) * force;
            let fy = (dy / dist) * force;

            if (!nodeA.pinned) {
              nodeA.vx -= fx;
              nodeA.vy -= fy;
            }
            if (!nodeB.pinned) {
              nodeB.vx += fx;
              nodeB.vy += fy;
            }
          }
        }
      }

      // 2. Link Attraction
      allGraphEdges.forEach((edge) => {
        const nodeA = nextState[edge.source];
        const nodeB = nextState[edge.target];
        if (!nodeA || !nodeB) return;

        let dx = nodeB.x - nodeA.x;
        let dy = nodeB.y - nodeA.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;

        let force = (dist - linkDistance) * 0.04;
        let fx = (dx / dist) * force;
        let fy = (dy / dist) * force;

        if (!nodeA.pinned) {
          nodeA.vx += fx;
          nodeA.vy += fy;
        }
        if (!nodeB.pinned) {
          nodeB.vx -= fx;
          nodeB.vy -= fy;
        }
      });

      // 3. Gravity & Damping
      keys.forEach((id) => {
        const node = nextState[id];
        if (!node || node.pinned) return;

        let dx = centerX - node.x;
        let dy = centerY - node.y;
        node.vx += dx * 0.005;
        node.vy += dy * 0.005;

        node.vx *= 0.85;
        node.vy *= 0.85;

        node.x += node.vx;
        node.y += node.vy;
      });

      return nextState;
    });
  }, [isPhysicsRunning, repulsionStrength, linkDistance, allGraphEdges]);

  useEffect(() => {
    if (!isPhysicsRunning) return;
    const animate = () => {
      runPhysicsStep();
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPhysicsRunning, runPhysicsStep]);

  // Pan & Centered Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(4, Math.max(0.15, zoomLevel * zoomFactor));

    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newPanX = mouseX - (mouseX - panOffset.x) * (newZoom / zoomLevel);
    const newPanY = mouseY - (mouseY - panOffset.y) * (newZoom / zoomLevel);

    setZoomLevel(newZoom);
    setPanOffset({ x: newPanX, y: newPanY });
  };

  const handleCanvasPointerDown = (e) => {
    if (
      e.target.tagName === "svg" ||
      e.target.getAttribute("data-canvas-bg") === "true"
    ) {
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      };
      setSelectedCanvasNodeId(null);
      setSelectedEdge(null);
    }
  };

  const handleCanvasPointerMove = (e) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    if (!svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
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

      setNodePhysicsState((prev) => ({
        ...prev,
        [draggingNodeId]: {
          ...prev[draggingNodeId],
          x: (prev[draggingNodeId]?.x || 0) + dx,
          y: (prev[draggingNodeId]?.y || 0) + dy,
          pinned: true,
        },
      }));
    }
  };

  const handleCanvasPointerUp = (e) => {
    setIsPanning(false);

    if (dragConnection) {
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

  const handleCanvasPointerCancel = () => {
    setIsPanning(false);
    setDragConnection(null);
    setDraggingNodeId(null);
  };

  const handleNodePointerDown = (e, nodeId) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    if (e.shiftKey) {
      const pos = nodePhysicsState[nodeId] || { x: 0, y: 0 };
      setDragConnection({
        sourceId: nodeId,
        currentX: pos.x,
        currentY: pos.y,
      });
      return;
    }

    setDraggingNodeId(nodeId);
    dragStartPos.current = { x: e.clientX, y: e.clientY };

    const graphNode = allGraphNodes.find((n) => n.id === nodeId);
    if (graphNode) {
      if (!graphNode.isWikiNode) {
        setActiveNoteId(graphNode.id);
        setPreviewingWikiNode(null);
      } else if (graphNode.rawWikiObj) {
        selectWikiNodeForPreview(graphNode.rawWikiObj);
      }
    }
    setSelectedCanvasNodeId(nodeId);
    setSelectedEdge(null);
  };

  const fitToScreen = () => {
    const keys = Object.keys(nodePhysicsState);
    if (keys.length === 0) return;

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    keys.forEach((key) => {
      const pos = nodePhysicsState[key];
      if (pos) {
        if (pos.x < minX) minX = pos.x;
        if (pos.x > maxX) maxX = pos.x;
        if (pos.y < minY) minY = pos.y;
        if (pos.y > maxY) maxY = pos.y;
      }
    });

    const graphWidth = maxX - minX || 400;
    const graphHeight = maxY - minY || 400;
    const canvasWidth = svgRef.current ? svgRef.current.clientWidth : 800;
    const canvasHeight = svgRef.current ? svgRef.current.clientHeight : 600;

    const scaleX = (canvasWidth - 160) / graphWidth;
    const scaleY = (canvasHeight - 160) / graphHeight;
    const newZoom = Math.min(1.5, Math.max(0.3, Math.min(scaleX, scaleY)));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setZoomLevel(newZoom);
    setPanOffset({
      x: canvasWidth / 2 - centerX * newZoom,
      y: canvasHeight / 2 - centerY * newZoom,
    });
    addToast("Fitted graph canvas to screen", "info");
  };

  const resetCanvasView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    addToast("Reset zoom and pan view", "info");
  };

  const togglePinNode = (nodeId) => {
    setNodePhysicsState((prev) => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        pinned: !prev[nodeId]?.pinned,
      },
    }));
  };

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

  // Inline Markdown Parser
  const parseInlineMarkdown = (text) => {
    if (!text) return text;
    const parts = [];
    const regex = /(\[\[[^\]]+\]\]|\[[^\]]+\]\([^)]+\)|#[a-zA-Z0-9_\-]+)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const matchedStr = match[0];
      if (matchedStr.startsWith("[[")) {
        const targetTitle = matchedStr.slice(2, -2).split("|")[0].trim();
        const displayTitle =
          matchedStr.slice(2, -2).split("|")[1] || targetTitle;
        const isExistingNote = notes.some(
          (n) => n.title.toLowerCase() === targetTitle.toLowerCase(),
        );

        parts.push(
          <span
            key={`wl-${match.index}`}
            onClick={(e) => {
              e.stopPropagation();
              const found = notes.find(
                (n) => n.title.toLowerCase() === targetTitle.toLowerCase(),
              );
              if (found) {
                setActiveNoteId(found.id);
                setPreviewingWikiNode(null);
              } else {
                spawnWikipediaCandidateNode(targetTitle, false);
              }
            }}
            className={`px-1.5 py-0.5 rounded cursor-pointer font-medium transition inline-flex items-center space-x-1 ${
              isExistingNote
                ? "bg-indigo-950/80 text-indigo-300 hover:bg-indigo-900 border border-indigo-700/50"
                : "bg-cyan-950/80 text-cyan-300 hover:bg-cyan-900 border border-cyan-700/50"
            }`}
          >
            <LinkIcon className="w-2.5 h-2.5" />
            <span>{displayTitle}</span>
          </span>,
        );
      } else if (matchedStr.startsWith("#")) {
        const tagName = matchedStr.slice(1);
        parts.push(
          <span
            key={`tag-${match.index}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTag(selectedTag === tagName ? null : tagName);
            }}
            className="text-indigo-400 font-semibold cursor-pointer hover:underline mx-0.5"
          >
            #{tagName}
          </span>,
        );
      } else if (matchedStr.startsWith("[")) {
        const linkMatch = matchedStr.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          parts.push(
            <a
              key={`link-${match.index}`}
              href={linkMatch[2]}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline inline-flex items-center space-x-0.5"
            >
              <span>{linkMatch[1]}</span>
              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
            </a>,
          );
        } else {
          parts.push(matchedStr);
        }
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  // Full Markdown Renderer
  const renderFormattedMarkdown = (content) => {
    if (!content) return null;
    const lines = content.split("\n");
    const elements = [];
    let inCodeBlock = false;
    let codeBlockBuffer = [];
    let codeBlockLang = "";

    lines.forEach((line, index) => {
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          const codeText = codeBlockBuffer.join("\n");
          elements.push(
            <div
              key={`code-${index}`}
              className="my-3 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-[11px]"
            >
              <div className="bg-slate-900/80 px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  {codeBlockLang || "code"}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeText);
                    addToast("Copied code block to clipboard", "success");
                  }}
                  className="hover:text-indigo-400 flex items-center space-x-1 transition text-[10px]"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-3 overflow-x-auto text-slate-200">
                <code>{codeText}</code>
              </pre>
            </div>,
          );
          codeBlockBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBlockLang = line.trim().replace("```", "");
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockBuffer.push(line);
        return;
      }

      if (line.trim().startsWith("> [!")) {
        const match = line
          .trim()
          .match(/^>\s*\[\!(NOTE|TIP|WARNING|IMPORTANT)\]\s*(.*)$/i);
        if (match) {
          const type = match[1].toUpperCase();
          const text = match[2];
          const isWarn = type === "WARNING";
          const isTip = type === "TIP";
          const isImp = type === "IMPORTANT";

          elements.push(
            <div
              key={`callout-${index}`}
              className={`my-3 p-3.5 rounded-xl border flex items-start space-x-2.5 text-xs ${
                isWarn
                  ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
                  : isTip
                    ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                    : isImp
                      ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                      : "bg-indigo-950/30 border-indigo-500/40 text-indigo-200"
              }`}
            >
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold uppercase text-[10px] tracking-wider block mb-0.5">
                  {type}
                </span>
                <span>{parseInlineMarkdown(text)}</span>
              </div>
            </div>,
          );
          return;
        }
      }

      if (line.trim().startsWith("- [ ]") || line.trim().startsWith("- [x]")) {
        const isChecked = line.trim().startsWith("- [x]");
        const text = line.trim().replace(/^- \[(x| )\]\s*/, "");
        elements.push(
          <div
            key={`chk-${index}`}
            className="flex items-center space-x-2 my-1 text-slate-300"
          >
            {isChecked ? (
              <CheckSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
            <span className={isChecked ? "line-through text-slate-500" : ""}>
              {parseInlineMarkdown(text)}
            </span>
          </div>,
        );
        return;
      }

      if (line.startsWith("# ")) {
        elements.push(
          <h1
            key={`h1-${index}`}
            className="text-xl font-extrabold text-slate-100 mt-4 mb-2 border-b border-slate-800 pb-2"
          >
            {parseInlineMarkdown(line.slice(2))}
          </h1>,
        );
        return;
      }
      if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={`h2-${index}`}
            className="text-lg font-bold text-slate-200 mt-3 mb-1.5"
          >
            {parseInlineMarkdown(line.slice(3))}
          </h2>,
        );
        return;
      }
      if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={`h3-${index}`}
            className="text-sm font-semibold text-slate-300 mt-2 mb-1"
          >
            {parseInlineMarkdown(line.slice(4))}
          </h3>,
        );
        return;
      }

      const imgMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const alt = imgMatch[1];
        const src = imgMatch[2];
        elements.push(
          <div
            key={`img-${index}`}
            className="my-4 group relative inline-block max-w-full"
          >
            <img
              src={src}
              alt={alt}
              onClick={() => setLightboxImage({ url: src, caption: alt })}
              className="rounded-xl border border-slate-800 hover:border-cyan-500/60 max-h-72 object-cover cursor-pointer transition shadow-lg"
            />
            {alt && (
              <p className="text-[10px] text-slate-400 italic mt-1 text-center">
                {alt}
              </p>
            )}
          </div>,
        );
        return;
      }

      if (!line.trim()) {
        elements.push(<div key={`empty-${index}`} className="h-2" />);
        return;
      }

      elements.push(
        <p key={`p-${index}`} className="text-slate-300 my-1 leading-relaxed">
          {parseInlineMarkdown(line)}
        </p>,
      );
    });

    return elements;
  };

  const currentStats = getNoteStats(activeNote?.content || "");
  const brandMark = (
    <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 shadow-lg shadow-indigo-500/20">
      <Network className="w-5 h-5 text-white animate-pulse" />
    </div>
  );
  const brandTitle = (
    <div className="flex items-center space-x-2">
      <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 text-lg">
        SynapseWiki
      </span>
      <span className="app-version text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
        v2.4
      </span>
    </div>
  );

  return (
    <div className="app-shell flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* HEADER NAVBAR */}
      <header className="app-header relative h-14 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0">
        <button
          type="button"
          onClick={onToggleTheme}
          className="theme-toggle rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-sm text-slate-300 hover:text-slate-900"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>
        <div className="app-brand flex items-center space-x-3">
          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/70 px-2 py-1.5 text-slate-400 transition hover:border-slate-700 hover:text-white"
              aria-label="Back to home"
              title="Back to home"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Home</span>
            </button>
          )}
          {onExit ? (
            <button
              type="button"
              onClick={onExit}
              className="app-logo flex items-center space-x-3 rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
              aria-label="Back to main page"
              title="Back to main page"
            >
              {brandMark}
              {brandTitle}
            </button>
          ) : (
            <div className="app-logo flex items-center space-x-3">
              {brandMark}
              {brandTitle}
            </div>
          )}
        </div>

        <div className="relative header-search w-64 hidden md:block mobile-search">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter vault notes or #tags..."
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

        <div className="header-actions flex items-center space-x-3">
          {hasAccountStorage && (
            <div className="project-controls flex items-center gap-1">
              <select
                value={cloudProjectId || ""}
                onChange={(event) =>
                  selectAccountProject(event.target.value)
                }
                disabled={isProjectBusy || cloudProjects.length === 0}
                aria-label="Select account project"
                className="max-w-36 rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-1.5 text-xs text-slate-200"
              >
                {cloudProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={createAccountWorkspace}
                disabled={isProjectBusy}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-slate-300 hover:text-white disabled:opacity-50"
                aria-label="Create project"
                title="Create project"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={renameAccountWorkspace}
                disabled={isProjectBusy || !cloudProjectId}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-slate-300 hover:text-white disabled:opacity-50"
                aria-label="Rename project"
                title="Rename project"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={deleteAccountWorkspace}
                disabled={isProjectBusy || cloudProjects.length <= 1}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-slate-300 hover:text-rose-400 disabled:opacity-50"
                aria-label="Delete project"
                title="Delete project"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="view-mode-control flex bg-slate-950/80 p-1 rounded-lg border border-slate-800/80 text-xs font-medium">
            <button
              onClick={() => setViewMode("canvas")}
              className={`px-3 py-1 rounded-md flex items-center space-x-1.5 transition ${
                viewMode === "canvas"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
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
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editor</span>
            </button>
          </div>

          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="mobile-utility p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition"
            title="Keyboard Shortcuts Legend"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsAnalyticsOpen(true)}
            className="mobile-utility p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition flex items-center space-x-1 text-xs px-2"
            title="Vault Analytics Dashboard"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-xs">Analytics</span>
          </button>

          <button
            onClick={exportVaultJSON}
            className="mobile-utility p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition flex items-center space-x-1 text-xs px-2"
            title="Export Vault JSON Backup"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline text-xs">Backup</span>
          </button>

          {isDesktopBuild ? (
            <button
              onClick={handleChooseVaultLocation}
              className="mobile-utility p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-indigo-300 transition flex items-center space-x-1 text-xs px-2"
              title={vaultLocation || vaultStorageError || "Choose a local Markdown vault folder"}
              aria-label="Choose local vault folder"
            >
              <Folder className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-xs">
                {vaultLocation ? "Vault folder" : "Choose folder"}
              </span>
            </button>
          ) : (
            <span
              className="hidden xl:inline text-[10px] text-slate-500"
              title={hasAccountStorage ? "Projects are saved to your account" : "Browser IndexedDB storage"}
            >
              {hasAccountStorage ? "Cloud sync" : "IndexedDB"}
            </span>
          )}

          <label
            className="mobile-utility p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition flex items-center space-x-1 text-xs px-2 cursor-pointer"
            title="Import Vault JSON Backup"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline text-xs">Restore</span>
            <input
              type="file"
              accept=".json"
              onChange={importVaultJSON}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setIsCommandOpen(true)}
            className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition flex items-center space-x-1 text-xs px-2"
          >
            <Search className="w-3.5 h-3.5" />
            <kbd className="hidden lg:inline text-[10px] bg-slate-950 px-1 py-0.5 rounded text-slate-400 border border-slate-800">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={resetDemoVault}
            className="mobile-utility p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-amber-400 transition"
            title="Reset Vault State"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMobileSidebarOpen((open) => !open)}
            className="mobile-sidebar-toggle hidden p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            aria-label={mobileSidebarOpen ? "Close vault sidebar" : "Open vault sidebar"}
            aria-expanded={mobileSidebarOpen}
            aria-controls="app-sidebar"
          >
            {mobileSidebarOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setMobileToolsOpen((open) => !open)}
            className="mobile-tools-toggle hidden p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            aria-label={mobileToolsOpen ? "Close app tools" : "More app tools"}
            aria-expanded={mobileToolsOpen}
            aria-controls="mobile-tools-menu"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {mobileToolsOpen && (
            <div
              id="mobile-tools-menu"
              className="mobile-tools-menu absolute right-0 top-full z-40 mt-2 w-52 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl md:hidden"
            >
              <button
                onClick={() => {
                  setIsShortcutsOpen(true);
                  setMobileToolsOpen(false);
                }}
                className="mobile-tool-item"
              >
                <Keyboard className="w-4 h-4" />
                <span>Keyboard shortcuts</span>
              </button>
              <button
                onClick={() => {
                  setIsAnalyticsOpen(true);
                  setMobileToolsOpen(false);
                }}
                className="mobile-tool-item"
              >
                <BarChart2 className="w-4 h-4" />
                <span>Vault analytics</span>
              </button>
              <button
                onClick={() => {
                  exportVaultJSON();
                  setMobileToolsOpen(false);
                }}
                className="mobile-tool-item"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Backup vault</span>
              </button>
              <label className="mobile-tool-item cursor-pointer">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Restore vault</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={(event) => {
                    importVaultJSON(event);
                    setMobileToolsOpen(false);
                  }}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => {
                  resetDemoVault();
                  setMobileToolsOpen(false);
                }}
                className="mobile-tool-item"
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>Reset demo vault</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {isDesktopBuild && !vaultLocation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/95 p-6">
          <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
              <Folder className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              Choose your vault folder
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              SynapseWiki Desktop stores notes as Markdown files in a folder you
              choose. Your browser-granted folder access may need to be renewed
              when the app restarts.
            </p>
            {vaultStorageError && (
              <p className="mt-3 text-sm text-rose-300">{vaultStorageError}</p>
            )}
            <button
              onClick={handleChooseVaultLocation}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              <Folder className="h-4 w-4" />
              Select folder
            </button>
          </section>
        </div>
      )}

      {/* BODY CONTENT */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT SIDEBAR */}
        {mobileSidebarOpen && (
          <button
            className="sidebar-backdrop md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close vault sidebar"
          />
        )}
        <aside
          id="app-sidebar"
          className={`app-sidebar absolute inset-y-0 left-0 w-[85vw] max-w-80 md:relative md:inset-auto md:w-80 border-r border-slate-800/80 bg-slate-900/95 md:bg-slate-900/60 backdrop-blur-md flex-col z-20 shrink-0 ${
            mobileSidebarOpen ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {isDesktopBuild ? "Markdown Vault" : "IndexedDB Vault"}
              </span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                {notes.length}
              </span>
            </div>
            <button
              onClick={() => createNewNote()}
              className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs flex items-center space-x-1 px-2 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Note</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {notes.map((note) => {
              const isActive = note.id === activeNoteId && !previewingWikiNode;
              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setActiveNoteId(note.id);
                    setPreviewingWikiNode(null);
                    setMobileSidebarOpen(false);
                  }}
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
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* WIKIPEDIA MULTI-RESULT SEARCH DRAWER */}
          <div className="border-t border-slate-800/80 bg-slate-950/40 p-3 flex flex-col h-1/2 min-h-[240px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <Globe className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                  Wikipedia Search API
                </span>
              </div>
              {wikiNodes.length > 0 && (
                <button
                  onClick={pruneAllGhostNodes}
                  className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                  title="Prune all unimported candidate nodes"
                >
                  <Scissors className="w-3 h-3" />
                  <span>Prune ({wikiNodes.length})</span>
                </button>
              )}
            </div>

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
                  placeholder="Search Wikipedia (e.g. Quantum)..."
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

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar text-xs">
              {wikiSearchResults.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                    Search Results ({wikiSearchResults.length}):
                  </span>
                  {wikiSearchResults.map((result) => (
                    <div
                      key={result.pageid}
                      className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-cyan-200 text-xs truncate">
                          {result.title}
                        </h4>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {result.wordcount} w
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {result.snippet}
                      </p>
                      <div className="flex items-center space-x-1.5 pt-1">
                        <button
                          onClick={() =>
                            spawnWikipediaCandidateNode(result.title, false)
                          }
                          className="px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 rounded text-[10px] font-semibold transition flex items-center space-x-1"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>Add Canvas Ghost</span>
                        </button>
                        <button
                          onClick={() =>
                            fetchWikipediaArticleNetwork(result.title)
                          }
                          className="px-2 py-0.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 rounded text-[10px] font-semibold transition flex items-center space-x-1"
                        >
                          <Network className="w-2.5 h-2.5" />
                          <span>1-Hop Network</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : previewingWikiNode ? (
                <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-cyan-200 text-xs">
                      {previewingWikiNode.title}
                    </h4>
                    <button
                      onClick={() => importWikipediaNode(previewingWikiNode)}
                      className="p-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded text-[10px] flex items-center space-x-1 transition shadow-sm"
                    >
                      <Download className="w-3 h-3" />
                      <span>Import .md</span>
                    </button>
                  </div>
                  {previewingWikiNode.thumbnail && (
                    <img
                      src={previewingWikiNode.thumbnail}
                      alt={previewingWikiNode.title}
                      className="w-full h-24 object-cover rounded border border-cyan-800/50"
                    />
                  )}
                  <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                    {previewingWikiNode.summary}
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 space-y-1">
                  <Compass className="w-6 h-6 mx-auto text-slate-600" />
                  <p className="text-[11px]">
                    Search any topic to view multiple Wikipedia options and
                    selectively spawn candidate nodes.
                  </p>
                </div>
              )}
            </div>
          </div>

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

        {/* WORKSPACE CENTER & RIGHT */}
        <div
          className={`workspace-center flex-1 flex overflow-hidden relative min-w-0 ${
            viewMode === "split" ? "workspace-split" : ""
          }`}
        >
          {/* 1. GRAPH CANVAS WITH LOD GRID BACKGROUND */}
          {(viewMode === "canvas" || viewMode === "split") && (
            <div
              className={`workspace-graph relative bg-[#090d16] flex-1 h-full overflow-hidden select-none ${
                viewMode === "split" ? "border-r border-slate-800/80" : ""
              } ${theme === "light" ? "light" : ""}`}
            >
              {/* TOOLBAR */}
              <div className="graph-toolbar absolute top-3 left-3 z-10 flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 text-xs text-slate-300 shadow-xl">
                <button
                  onClick={() => setIsPhysicsRunning(!isPhysicsRunning)}
                  className={`p-1.5 rounded-lg flex items-center space-x-1 text-xs font-semibold transition ${
                    isPhysicsRunning
                      ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-600/20 text-amber-400 border border-amber-500/30"
                  }`}
                  title="Toggle Physics Simulation (Space)"
                >
                  {isPhysicsRunning ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {isPhysicsRunning ? "Pause" : "Play"}
                  </span>
                </button>

                <div className="h-4 w-px bg-slate-800" />

                {wikiNodes.length > 0 && (
                  <button
                    onClick={pruneAllGhostNodes}
                    className="p-1.5 bg-amber-950/80 border border-amber-800/80 text-amber-300 rounded-lg hover:bg-amber-900 transition flex items-center space-x-1"
                    title="Prune all unimported candidate nodes"
                  >
                    <Scissors className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] hidden sm:inline">
                      Prune ({wikiNodes.length})
                    </span>
                  </button>
                )}

                <div className="h-4 w-px bg-slate-800" />

                <button
                  onClick={() => setZoomLevel((z) => Math.min(4, z * 1.2))}
                  className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.15, z * 0.8))}
                  className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={fitToScreen}
                  className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:text-white"
                  title="Fit Graph to Screen"
                >
                  <Focus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={resetCanvasView}
                  className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:text-white"
                  title="Reset View Scale"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-px bg-slate-800" />

                <span className="text-[10px] font-mono text-slate-500">
                  {Math.round(zoomLevel * 100)}%
                </span>
              </div>

              {/* Edge Popup */}
              {selectedEdge && (
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20 bg-slate-900 border border-slate-800 p-2.5 rounded-xl shadow-2xl flex items-center space-x-3 text-xs">
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
                    <span>Delete Link</span>
                  </button>
                  <button
                    onClick={() => setSelectedEdge(null)}
                    className="p-1 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* SVG GRAPH CANVAS WITH MULTI-SCALE LOD GRID */}
              <svg
                ref={svgRef}
                className={`w-full h-full touch-none ${
                  isPanning ? "cursor-grabbing" : "cursor-grab"
                }`}
                onWheel={handleWheel}
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerCancel={handleCanvasPointerCancel}
              >
                <defs>
                  {/* Fine Grid: 20px - Fades out on zoom out */}
                  <pattern
                    id="grid-fine"
                    width={20 * zoomLevel}
                    height={20 * zoomLevel}
                    patternUnits="userSpaceOnUse"
                    x={panOffset.x}
                    y={panOffset.y}
                  >
                    <path
                      d={`M ${20 * zoomLevel} 0 L 0 0 0 ${20 * zoomLevel}`}
                      fill="none"
                      stroke={theme === "light" ? "#e2e8f0" : "#1e293b"}
                      strokeWidth="0.5"
                      strokeOpacity={Math.max(
                        0,
                        Math.min(0.5, (zoomLevel - 0.4) * 1.5),
                      )}
                    />
                  </pattern>
                  {/* Medium Grid: 100px */}
                  <pattern
                    id="grid-medium"
                    width={100 * zoomLevel}
                    height={100 * zoomLevel}
                    patternUnits="userSpaceOnUse"
                    x={panOffset.x}
                    y={panOffset.y}
                  >
                    <path
                      d={`M ${100 * zoomLevel} 0 L 0 0 0 ${100 * zoomLevel}`}
                      fill="none"
                      stroke={theme === "light" ? "#cbd5e1" : "#334155"}
                      strokeWidth="1"
                      strokeOpacity={Math.max(0.15, Math.min(0.8, zoomLevel))}
                    />
                  </pattern>
                  {/* Major Grid: 500px */}
                  <pattern
                    id="grid-major"
                    width={500 * zoomLevel}
                    height={500 * zoomLevel}
                    patternUnits="userSpaceOnUse"
                    x={panOffset.x}
                    y={panOffset.y}
                  >
                    <path
                      d={`M ${500 * zoomLevel} 0 L 0 0 0 ${500 * zoomLevel}`}
                      fill="none"
                      stroke={theme === "light" ? "#94a3b8" : "#475569"}
                      strokeWidth="1.5"
                      strokeOpacity="0.4"
                    />
                  </pattern>

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
                </defs>

                <rect
                  width="100%"
                  height="100%"
                  fill={theme === "light" ? "#f1f5f9" : "#090d16"}
                  data-canvas-bg="true"
                />
                <rect
                  width="100%"
                  height="100%"
                  fill="url(#grid-fine)"
                  pointerEvents="none"
                />
                <rect
                  width="100%"
                  height="100%"
                  fill="url(#grid-medium)"
                  pointerEvents="none"
                />
                <rect
                  width="100%"
                  height="100%"
                  fill="url(#grid-major)"
                  pointerEvents="none"
                />

                <g
                  transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
                >
                  {/* EDGES */}
                  {allGraphEdges.map((edge) => {
                    const sourcePos = nodePhysicsState[edge.source];
                    const targetPos = nodePhysicsState[edge.target];
                    if (!sourcePos || !targetPos) return null;

                    const isSelected =
                      selectedEdge?.source === edge.source &&
                      selectedEdge?.target === edge.target;

                    const isWikiEdge = edge.type === "wiki";

                    return (
                      <g key={edge.id}>
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
                        />
                        <line
                          x1={sourcePos.x}
                          y1={sourcePos.y}
                          x2={targetPos.x}
                          y2={targetPos.y}
                          stroke="transparent"
                          strokeWidth="14"
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEdge(edge);
                          }}
                        />
                      </g>
                    );
                  })}

                  {/* ACTIVE CONNECTION DRAG LINE */}
                  {dragConnection &&
                    nodePhysicsState[dragConnection.sourceId] && (
                      <line
                        x1={nodePhysicsState[dragConnection.sourceId].x}
                        y1={nodePhysicsState[dragConnection.sourceId].y}
                        x2={dragConnection.currentX}
                        y2={dragConnection.currentY}
                        stroke="#22d3ee"
                        strokeWidth="2.5"
                        strokeDasharray="6 4"
                        className="animate-pulse"
                      />
                    )}

                  {/* NODES */}
                  {allGraphNodes.map((node) => {
                    const physicsObj = nodePhysicsState[node.id] || {
                      x: 0,
                      y: 0,
                      pinned: false,
                    };
                    const isActiveNode =
                      node.id === activeNoteId && !previewingWikiNode;
                    const isPreviewingThisNode =
                      previewingWikiNode &&
                      previewingWikiNode.title.toLowerCase() ===
                        node.title.toLowerCase();
                    const isSelectedCanvas = selectedCanvasNodeId === node.id;
                    const isWikipedia = node.isWikiNode;
                    const isOrphan = node.type === "orphan";
                    const isMatch = isNodeMatchingFilter(node);

                    const radius = Math.min(
                      34,
                      Math.max(16, 16 + (node.degree || 0) * 3),
                    );

                    return (
                      <g
                        key={node.id}
                        data-node-id={node.id}
                        transform={`translate(${physicsObj.x}, ${physicsObj.y})`}
                        onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                        className={`cursor-pointer transition-opacity duration-300 ${
                          isMatch ? "opacity-100" : "opacity-15"
                        }`}
                      >
                        {(isActiveNode ||
                          isPreviewingThisNode ||
                          isSelectedCanvas) && (
                          <circle
                            r={radius + 8}
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

                        <circle
                          r={radius}
                          fill={
                            isWikipedia
                              ? "#083344"
                              : isOrphan
                                ? "#334155"
                                : isActiveNode
                                  ? "#4f46e5"
                                  : "#1e1b4b"
                          }
                          stroke={
                            isWikipedia
                              ? "#22d3ee"
                              : isOrphan
                                ? "#64748b"
                                : isActiveNode
                                  ? "#a5b4fc"
                                  : "#6366f1"
                          }
                          strokeWidth={isWikipedia ? "2.5" : "2"}
                          strokeDasharray={isWikipedia ? "4 2" : "none"}
                        />

                        {isWikipedia ? (
                          <Globe className="w-4 h-4 text-cyan-400 -translate-x-2 -translate-y-2 pointer-events-none" />
                        ) : (
                          <FileText className="w-4 h-4 text-indigo-300 -translate-x-2 -translate-y-2 pointer-events-none" />
                        )}

                        <text
                          y={radius + 14}
                          textAnchor="middle"
                          fill={
                            isWikipedia
                              ? "#67e8f9"
                              : isActiveNode
                                ? "#ffffff"
                                : "#cbd5e1"
                          }
                          fontSize="11"
                          fontWeight={
                            isActiveNode || isPreviewingThisNode ? "700" : "500"
                          }
                          className="pointer-events-none select-none drop-shadow-md"
                        >
                          {node.title}
                        </text>

                        {/* Ghost Node Prune Button */}
                        {isWikipedia && isSelectedCanvas && (
                          <g
                            transform={`translate(${-radius + 2}, ${-radius + 2})`}
                            onClick={(e) => {
                              e.stopPropagation();
                              pruneGhostNode(node.id);
                            }}
                          >
                            <circle
                              r="8"
                              fill="#450a0a"
                              stroke="#f43f5e"
                              strokeWidth="1"
                            />
                            <X className="w-3 h-3 text-red-400 -translate-x-1.5 -translate-y-1.5" />
                          </g>
                        )}

                        {/* Pin Badge */}
                        <g
                          transform={`translate(${radius - 4}, ${-radius + 4})`}
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePinNode(node.id);
                          }}
                        >
                          <circle
                            r="7"
                            fill="#0f172a"
                            stroke="#334155"
                            strokeWidth="1"
                          />
                          {physicsObj.pinned ? (
                            <Pin className="w-2.5 h-2.5 text-amber-400 -translate-x-1.2 -translate-y-1.2" />
                          ) : (
                            <PinOff className="w-2.5 h-2.5 text-slate-500 -translate-x-1.2 -translate-y-1.2" />
                          )}
                        </g>
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* MINI MAP */}
              {showMiniMap && (
                <div className="mini-map absolute bottom-4 right-4 w-40 h-32 bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-2xl pointer-events-none z-10 overflow-hidden">
                  <div className="text-[9px] font-bold text-slate-500 uppercase px-1 mb-0.5">
                    Mini-Map
                  </div>
                  <svg className="w-full h-full">
                    {allGraphNodes.map((n) => {
                      const pos = nodePhysicsState[n.id] || { x: 0, y: 0 };
                      const miniX = (pos.x / 800) * 140;
                      const miniY = (pos.y / 700) * 100;
                      return (
                        <circle
                          key={`mini-${n.id}`}
                          cx={Math.max(5, Math.min(135, miniX))}
                          cy={Math.max(5, Math.min(95, miniY))}
                          r={n.id === activeNoteId ? 3 : 1.5}
                          fill={n.isWikiNode ? "#06b6d4" : "#6366f1"}
                        />
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* 2. MARKDOWN EDITOR & PREVIEW PANEL */}
          {(viewMode === "editor" || viewMode === "split") && (
            <div className="workspace-editor flex-1 flex flex-col h-full bg-slate-950 overflow-hidden min-w-0">
              {/* UNIMPORTED WIKIPEDIA STICKY PREVIEW BANNER */}
              {previewingWikiNode && (
                <div className="bg-cyan-950/90 border-b border-cyan-500/40 px-4 py-2.5 flex items-center justify-between text-xs text-cyan-200 shrink-0 shadow-lg">
                  <div className="flex items-center space-x-2 truncate">
                    <Globe className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
                    <span className="truncate">
                      Previewing Candidate Article:{" "}
                      <strong className="text-white font-bold">
                        {previewingWikiNode.title}
                      </strong>
                    </span>
                    <span className="text-[10px] bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 px-2 py-0.5 rounded-full shrink-0">
                      Unimported Candidate
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      disabled={isExtendingWiki}
                      onClick={() => extendWikipediaArticle(previewingWikiNode)}
                      className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold rounded-lg flex items-center space-x-1.5 transition shadow-lg disabled:opacity-50"
                      title="Fetch full article text & image gallery"
                    >
                      {isExtendingWiki ? (
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Maximize2 className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isExtendingWiki
                          ? "Extending..."
                          : "Extend Article & Images"}
                      </span>
                    </button>
                    <button
                      onClick={() => importWikipediaNode(previewingWikiNode)}
                      className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg flex items-center space-x-1 transition shadow-sm"
                    >
                      <Download className="w-3 h-3" />
                      <span>Import Note</span>
                    </button>
                    <button
                      onClick={() => setPreviewingWikiNode(null)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Close Preview"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* EDITOR SUBHEADER */}
              <div className="editor-subheader h-10 border-b border-slate-800/80 bg-slate-900/50 px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {previewingWikiNode
                      ? `/Wikipedia/${previewingWikiNode.title}.md`
                      : activeNote?.path}
                  </span>
                  {previewingWikiNode ? (
                    <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded">
                      Wikipedia Live Extract
                    </span>
                  ) : activeNote?.isWikiImport ? (
                    <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded">
                      Wikipedia Import
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center space-x-3">
                  {!previewingWikiNode &&
                    activeNote &&
                    (activeNote.isWikiImport ||
                      activeNote.path.startsWith("/Wikipedia/")) && (
                      <button
                        disabled={isExtendingWiki}
                        onClick={() => extendWikipediaArticle(activeNote)}
                        className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 rounded-lg text-xs font-semibold flex items-center space-x-1 transition disabled:opacity-50"
                        title="Fetch full article text & media images from Wikipedia"
                      >
                        {isExtendingWiki ? (
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                        ) : (
                          <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                        <span className="hidden sm:inline">
                          {isExtendingWiki
                            ? "Extending..."
                            : "Extend Article & Images"}
                        </span>
                      </button>
                    )}

                  {!previewingWikiNode && (
                    <button
                      onClick={exportCurrentNote}
                      className="p-1 text-slate-400 hover:text-emerald-400 transition"
                      title="Export .md file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                    <button
                      disabled={!!previewingWikiNode}
                      onClick={() => setEditorTab("edit")}
                      className={`px-2.5 py-0.5 rounded flex items-center space-x-1 transition ${
                        editorTab === "edit" && !previewingWikiNode
                          ? "bg-indigo-600 text-white font-medium"
                          : "text-slate-400 hover:text-slate-200 disabled:opacity-30"
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setEditorTab("preview")}
                      className={`px-2.5 py-0.5 rounded flex items-center space-x-1 transition ${
                        editorTab === "preview" || previewingWikiNode
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

              {/* EDITOR BODY */}
              <div className="editor-body flex-1 flex flex-col overflow-hidden p-4 relative">
                {previewingWikiNode ? (
                  /* UNIMPORTED WIKIPEDIA PREVIEW DISPLAY */
                  <div className="flex-1 bg-slate-900/40 border border-cyan-800/40 rounded-xl p-6 overflow-y-auto custom-scrollbar text-xs leading-relaxed space-y-4">
                    <div className="border-b border-cyan-800/40 pb-3 flex items-start justify-between">
                      <div>
                        <h1 className="text-xl font-extrabold text-cyan-100 mb-1">
                          {previewingWikiNode.title}
                        </h1>
                        <a
                          href={previewingWikiNode.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline inline-flex items-center space-x-1 text-[11px]"
                        >
                          <span>Open original article on Wikipedia</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <button
                        onClick={() => importWikipediaNode(previewingWikiNode)}
                        className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg flex items-center space-x-1.5 transition shadow-md"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Import Note</span>
                      </button>
                    </div>

                    {previewingWikiNode.thumbnail && (
                      <img
                        src={previewingWikiNode.thumbnail}
                        alt={previewingWikiNode.title}
                        className="w-full max-h-48 object-cover rounded-xl border border-cyan-800/60 shadow-lg"
                      />
                    )}

                    <div className="bg-cyan-950/30 p-4 rounded-xl border border-cyan-800/40 text-cyan-200">
                      <span className="font-bold block text-[11px] text-cyan-400 uppercase tracking-wider mb-1">
                        Wikipedia Extract Abstract:
                      </span>
                      <p className="leading-relaxed text-slate-200">
                        {previewingWikiNode.summary}
                      </p>
                    </div>

                    {previewingWikiNode.links &&
                      previewingWikiNode.links.length > 0 && (
                        <div className="pt-2">
                          <h3 className="text-sm font-bold text-slate-300 mb-2">
                            1-Hop Connected Wikipedia Articles:
                          </h3>
                          <div className="flex flex-wrap gap-1.5">
                            {previewingWikiNode.links.map((l, idx) => (
                              <span
                                key={idx}
                                onClick={() => fetchWikipediaArticleNetwork(l)}
                                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-900/50 text-cyan-300 border border-slate-800 cursor-pointer transition text-xs flex items-center space-x-1"
                              >
                                <Link2 className="w-3 h-3 text-cyan-400" />
                                <span>{l}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ) : editorTab === "edit" && activeNote ? (
                  <div className="relative flex-1 flex flex-col">
                    <textarea
                      ref={editorRef}
                      value={activeNote.content}
                      onChange={handleEditorChange}
                      placeholder="Type Markdown notes... Type [[ to trigger wikilink autocomplete."
                      className="w-full flex-1 bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 resize-none leading-relaxed custom-scrollbar"
                    />

                    {/* [[ WIKILINK AUTOCOMPLETE DROPDOWN */}
                    {showAutocomplete && (
                      <div
                        style={{
                          top: `${autocompletePos.top}px`,
                          left: `${autocompletePos.left}px`,
                        }}
                        className="absolute z-50 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden p-1 text-xs"
                      >
                        <div className="text-[10px] font-bold text-slate-500 px-2 py-1 uppercase">
                          Insert [[Wikilink]]
                        </div>
                        {notes
                          .filter((n) =>
                            n.title
                              .toLowerCase()
                              .includes(autocompleteQuery.toLowerCase()),
                          )
                          .slice(0, 5)
                          .map((n) => (
                            <div
                              key={n.id}
                              onClick={() =>
                                insertWikilinkFromAutocomplete(n.title)
                              }
                              className="p-2 hover:bg-indigo-600/30 rounded-lg cursor-pointer flex items-center justify-between text-slate-200"
                            >
                              <span className="font-semibold">{n.title}</span>
                              <span className="text-[9px] text-slate-500">
                                {n.path}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ) : activeNote ? (
                  /* FORMATTED PREVIEW */
                  <div className="flex-1 bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 overflow-y-auto custom-scrollbar text-xs leading-relaxed space-y-3">
                    {renderFormattedMarkdown(activeNote.content)}
                  </div>
                ) : null}

                {/* METADATA BAR */}
                {!previewingWikiNode && (
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <div className="flex items-center space-x-3">
                      <span>{currentStats.words} words</span>
                      <span>•</span>
                      <span>{currentStats.chars} chars</span>
                      <span>•</span>
                      <span>{currentStats.readTime} min read</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {activeNoteBacklinks.length === 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          Orphan Note
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* BACKLINKS & UNLINKED MENTIONS PANEL */}
                {!previewingWikiNode && activeNote && (
                  <div
                    className={`editor-backlinks mt-2 border-t border-slate-800/80 pt-3 bg-slate-900/30 p-3 rounded-xl shrink-0 ${
                      viewMode === "split" ? "mobile-split-backlinks" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Linked References & Unlinked Mentions</span>
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {activeNoteBacklinks.length} backlink(s)
                      </span>
                    </div>

                    {activeNoteBacklinks.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {activeNoteBacklinks.map((bNote) => (
                          <div
                            key={bNote.id}
                            onClick={() => {
                              setActiveNoteId(bNote.id);
                              setPreviewingWikiNode(null);
                            }}
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
                        No explicitly linked references to [[{activeNote.title}
                        ]] yet.
                      </p>
                    )}

                    {unlinkedReferences.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-800/50">
                        <span className="text-[10px] font-bold text-amber-400 block mb-1">
                          Unlinked Text Mentions ({unlinkedReferences.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {unlinkedReferences.map((uNote) => (
                            <button
                              key={uNote.id}
                              onClick={() =>
                                addVisualLink(uNote.title, activeNote.title)
                              }
                              className="text-[10px] px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/50 hover:bg-amber-900 transition flex items-center space-x-1"
                            >
                              <span>Link in "{uNote.title}"</span>
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KEYBOARD SHORTCUTS MODAL */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Keyboard className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
                  Keyboard Shortcuts Legend
                </h3>
              </div>
              <button
                onClick={() => setIsShortcutsOpen(false)}
                className="p-1 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-300">Command Palette & Search</span>
                <kbd className="bg-slate-800 text-indigo-300 px-2 py-0.5 rounded border border-slate-700 font-mono text-[10px]">
                  Cmd / Ctrl + K
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-300">
                  Toggle View Mode (Split / Editor / Canvas)
                </span>
                <kbd className="bg-slate-800 text-indigo-300 px-2 py-0.5 rounded border border-slate-700 font-mono text-[10px]">
                  Cmd / Ctrl + E
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-300">
                  Toggle Physics Simulation Play / Pause
                </span>
                <kbd className="bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700 font-mono text-[10px]">
                  Spacebar
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-300">
                  Prune Selected Candidate Ghost Node
                </span>
                <kbd className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700 font-mono text-[10px]">
                  Delete / Backspace
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-300">
                  Rubber-Band Draw Connection
                </span>
                <kbd className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-slate-700 font-mono text-[10px]">
                  Shift + Mouse Drag
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-300">
                  Close Modals / Deselect Canvas Node
                </span>
                <kbd className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono text-[10px]">
                  Escape
                </kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS DASHBOARD MODAL */}
      {isAnalyticsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
                  Vault Topology Analytics
                </h3>
              </div>
              <button
                onClick={() => setIsAnalyticsOpen(false)}
                className="p-1 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-2xl font-black text-indigo-400 block">
                  {analytics.totalNotes}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  Total Vault Notes
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-2xl font-black text-cyan-400 block">
                  {analytics.totalLinks}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  Total [[Wikilinks]]
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-2xl font-black text-emerald-400 block">
                  {analytics.vaultDensity}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  Network Density
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Top Central Hubs
              </h4>
              <div className="space-y-1.5">
                {analytics.sortedHubs.map(([title, count]) => (
                  <div
                    key={title}
                    className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-200 font-medium">{title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {count} connections
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {analytics.orphans.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Orphan Notes ({analytics.orphans.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {analytics.orphans.map((o) => (
                    <span
                      key={o.id}
                      onClick={() => {
                        setActiveNoteId(o.id);
                        setPreviewingWikiNode(null);
                        setIsAnalyticsOpen(false);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 cursor-pointer hover:text-white"
                    >
                      {o.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMMAND PALETTE (CMD+K) */}
      {isCommandOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search notes or Wikipedia..."
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
                      setPreviewingWikiNode(null);
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
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATIONS */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-2.5 rounded-xl border text-xs font-medium shadow-2xl flex items-center space-x-2 animate-in slide-in-from-bottom-5 ${
              toast.type === "success"
                ? "bg-slate-900 border-indigo-500/50 text-indigo-200"
                : toast.type === "error"
                  ? "bg-slate-900 border-red-500/50 text-red-200"
                  : toast.type === "warning"
                    ? "bg-slate-900 border-amber-500/50 text-amber-200"
                    : "bg-slate-900 border-cyan-500/50 text-cyan-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* IMAGE LIGHTBOX MODAL */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 flex flex-col items-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 p-1.5 bg-slate-950 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.caption}
              className="max-h-[75vh] w-auto object-contain rounded-xl border border-slate-800/80 shadow-2xl"
            />
            {lightboxImage.caption && (
              <p className="text-xs text-slate-300 mt-3 text-center italic max-w-xl">
                {lightboxImage.caption}
              </p>
            )}
            <a
              href={lightboxImage.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 text-xs text-cyan-400 hover:underline flex items-center space-x-1 font-medium"
            >
              <span>Open original full resolution image</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
