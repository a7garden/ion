export interface NodePosition {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  isDragging: boolean;
  rotation?: number;
}

type Listener = () => void;

interface PositionStoreAPI {
  updatePositions: (nodes: NodePosition[]) => void;
  updateSinglePosition: (id: string, x: number, y: number) => void;
  setDragging: (id: string | null) => void;
  getDraggingId: () => string | null;
  setDeleteMode: (id: string | null) => void;
  getDeleteModeId: () => string | null;
  setDragVelocity: (id: string, vx: number, vy: number) => void;
  getDragVelocity: (id: string) => { vx: number; vy: number } | undefined;
  consumeDragVelocity: (id: string) => { vx: number; vy: number } | undefined;
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => NodePosition[];
}

const positions = new Map<string, NodePosition>();
const listeners = new Set<Listener>();
let draggingId: string | null = null;
let deleteModeId: string | null = null;
let cachedSnapshot: NodePosition[] = [];
const dragVelocities = new Map<string, { vx: number; vy: number }>();

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
    notifyListeners();
  },

  updateSinglePosition(id: string, x: number, y: number) {
    const node = positions.get(id);
    if (node) {
      node.x = x;
      node.y = y;
      cachedSnapshot = Array.from(positions.values());
      notifyListeners();
    }
  },

  setDragging(id: string | null) {
    draggingId = id;
    notifyListeners();
  },

  getDraggingId() {
    return draggingId;
  },

  setDeleteMode(id: string | null) {
    deleteModeId = id;
    notifyListeners();
  },

  getDeleteModeId() {
    return deleteModeId;
  },

  setDragVelocity(id: string, vx: number, vy: number) {
    dragVelocities.set(id, { vx, vy });
  },

  getDragVelocity(id: string) {
    return dragVelocities.get(id);
  },

  consumeDragVelocity(id: string) {
    const v = dragVelocities.get(id);
    dragVelocities.delete(id);
    return v;
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
