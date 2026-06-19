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
  markForDismissal: (id: string, vx: number, vy: number) => void;
  getDismissedId: () => string | null;
  getDismissDirection: () => { vx: number; vy: number } | null;
  consumeDismissedAndNotify: (id: string) => void;
  consumePendingDataDelete: () => string | null;
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => NodePosition[];
}

const positions = new Map<string, NodePosition>();
const listeners = new Set<Listener>();
let draggingId: string | null = null;
let deleteModeId: string | null = null;
let dismissedId: string | null = null;
let dismissDirection: { vx: number; vy: number } | null = null;
let pendingDataDeleteId: string | null = null;
let cachedSnapshot: NodePosition[] = [];
const dragVelocities = new Map<string, { vx: number; vy: number }>();
let rafId: number | null = null;
let pendingUpdate: { id: string; x: number; y: number }[] = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

const flushPendingUpdates = () => {
  pendingUpdate.forEach(({ id, x, y }) => {
    const node = positions.get(id);
    if (node) {
      node.x = x;
      node.y = y;
    }
  });
  cachedSnapshot = Array.from(positions.values());
  notifyListeners();
  pendingUpdate = [];
  rafId = null;
};

const scheduleUpdate = (id: string, x: number, y: number) => {
  const existing = pendingUpdate.findIndex(p => p.id === id);
  if (existing >= 0) {
    pendingUpdate[existing] = { id, x, y };
  } else {
    pendingUpdate.push({ id, x, y });
  }
  if (rafId === null) {
    rafId = requestAnimationFrame(flushPendingUpdates);
  }
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
    scheduleUpdate(id, x, y);
  },

  setDragging(id: string | null) {
    if (id === null && rafId !== null) {
      flushPendingUpdates();
    }
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

  markForDismissal(id: string, vx: number, vy: number) {
    dismissedId = id;
    dismissDirection = { vx, vy };
  },

  getDismissedId() {
    return dismissedId;
  },

  getDismissDirection() {
    return dismissDirection;
  },

  consumeDismissedAndNotify(id: string) {
    dismissedId = null;
    dismissDirection = null;
    pendingDataDeleteId = id;
    notifyListeners();
  },

  consumePendingDataDelete() {
    const id = pendingDataDeleteId;
    pendingDataDeleteId = null;
    return id;
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
