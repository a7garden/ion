import { FeedPhysics } from './FeedPhysics';
import { FeedCards } from './FeedCards';
import { EmptyFeedState } from '@/components/EmptyFeedState';
import type { Post } from '@/types';

interface FeedViewProps {
  posts: Post[];
  onCardClick: (post: Post) => void;
  onDelete: (postId: string) => void;
  onCreatePostClick: () => void;
  expandedPostId?: string | null;
  onRefetch: () => void;
  likedIds?: string[];
  onToggleLike?: (postId: string) => void;
}

export function FeedView(props: FeedViewProps) {
  if (props.posts.length === 0) {
    return <EmptyFeedState onCreatePost={props.onCreatePostClick} />;
  }

  return (
    <div className="fixed inset-0 select-none">
      <FeedPhysics posts={props.posts} />
      <FeedCards
        posts={props.posts}
        onCardClick={props.onCardClick}
        onDelete={props.onDelete}
        expandedPostId={props.expandedPostId}
        likedIds={props.likedIds}
        onToggleLike={props.onToggleLike}
      />
    </div>
  );
}
