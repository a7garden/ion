import { FeedPhysics } from './FeedPhysics';
import { FeedCards } from './FeedCards';
import { TrashZone } from './TrashZone';

interface FeedViewProps {
  onCardClick: (authorId: string, content: string) => void;
  onToggleLike: (postId: string, authorId: string) => void;
  onDelete: (postId: string) => void;
}

export function FeedView({ onCardClick, onToggleLike, onDelete }: FeedViewProps) {
  return (
    <>
      <FeedPhysics onCardClick={onCardClick} onDelete={onDelete} />
      <FeedCards onCardClick={onCardClick} onToggleLike={onToggleLike} />
      <TrashZone />
    </>
  );
}
