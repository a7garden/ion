import { useSyncExternalStore } from 'react';
import { positionStore } from '@/stores/positionStore';

export function TrashZone() {
  const draggingId = useSyncExternalStore(
    positionStore.subscribe,
    positionStore.getDraggingId
  );

  if (!draggingId) return null;

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-50">
      <div className="bg-red-500 rounded-full p-4 shadow-lg animate-bounce">
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </div>
      <span className="text-xs text-white mt-2 bg-black/70 px-2 py-1 rounded">
        드롭하여 삭제
      </span>
    </div>
  );
}
