export interface NodePosition {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  isDragging: boolean;
}

type Listener = () => void;

interface PositionStoreAPI {
  updatePositions: (nodes: NodePosition[]) => void;
  setDragging: (id: string | null) => void;
  getDraggingId: () => string | null;
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => NodePosition[];
}

const positions = new Map<string, NodePosition>();
const listeners = new Set<Listener>();
let draggingId: string | null = null;
let cachedSnapshot: NodePosition[] = [];
let version = 0;

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

const positionStore: PositionStoreAPI = {
  updatePositions(nodes: NodePosition[]) {
    positions.clear();
    nodes.forEach((node) => {
      positions.set(node.id, node);
    });
    cachedSnapshot = Array.from(positions.values());
    version++;
    notifyListeners();
  },

  setDragging(id: string | null) {
    draggingId = id;
    notifyListeners();
  },

  getDraggingId() {
    return draggingId;
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot() {
    return cachedSnapshot;
  },
};

export { positionStore };
