import { useApp } from '@/hooks/AppProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function Sidebar() {
  const { state, addFriend, deleteFriend } = useApp();
  const [friendInput, setFriendInput] = useState('');
  const { toast } = useToast();

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendInput.trim()) {
      toast({ description: 'Please enter a friend ID', duration: 2000 });
      return;
    }
    if (state.friends.some(f => f.name === friendInput.trim())) {
      toast({ description: 'Friend already added', duration: 2000 });
      return;
    }
    addFriend(friendInput);
    toast({ description: `Added ${friendInput.trim()} as friend`, duration: 2000 });
    setFriendInput('');
  };

  const handleDeleteFriend = (index: number) => {
    const deleted = state.friends[index];
    deleteFriend(index);
    toast({ description: `Removed ${deleted.name}`, duration: 2000 });
  };

  return (
    <aside
      className={`fixed left-0 top-[60px] bottom-0 w-[280px] bg-card border-r border-border p-5 transition-transform duration-300 z-50 overflow-y-auto ${
        state.sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <h3 className="text-base font-semibold mb-4 text-foreground">Friends</h3>

      <form onSubmit={handleAddFriend} className="flex gap-2 mb-5">
        <Input
          type="text"
          placeholder="Friend ID"
          value={friendInput}
          onChange={(e) => setFriendInput(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="secondary">
          Add
        </Button>
      </form>

      {state.friends.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-5">No friends yet</p>
      ) : (
        <ul className="space-y-2">
          {state.friends.map((friend, index) => (
            <li
              key={friend.id}
              className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-accent transition-colors"
            >
              <span className="text-sm font-medium text-foreground">{friend.name}</span>
              <button
                onClick={() => handleDeleteFriend(index)}
                className="text-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}