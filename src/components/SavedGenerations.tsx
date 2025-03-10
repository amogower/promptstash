import React from 'react';
import { useStore, SavedGeneration } from '@/lib/store';
import { Search, Trash2, ArrowRight, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { getRandomHoverScheme } from '@/lib/utils';
import posthog from 'posthog-js';

export function SavedGenerations() {
  const { savedGenerations, fetchSavedGenerations, deleteSavedGeneration, loading, updateSavedGeneration } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');
  const [editContent, setEditContent] = React.useState('');

  React.useEffect(() => {
    fetchSavedGenerations();
  }, [fetchSavedGenerations]);

  const filteredGenerations = searchTerm
    ? savedGenerations.filter(g => 
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : savedGenerations;

  const handleDeleteGeneration = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this saved generation?')) {
      await deleteSavedGeneration(id);
      posthog.capture('generation:delete', { generation_id: id });
    }
  };

  const handleViewOriginalPrompt = (e: React.MouseEvent, promptId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (promptId) {
      navigate(`/prompt/${promptId}`);
      posthog.capture('generation:view_original', { prompt_id: promptId });
    }
  };

  const startEditing = (generation: SavedGeneration) => {
    setEditingId(generation.id);
    setEditTitle(generation.title);
    setEditContent(generation.content);
  };

  const saveEdits = async (id: string) => {
    await updateSavedGeneration(id, {
      title: editTitle,
      content: editContent
    });
    setEditingId(null);
    posthog.capture('generation:edit', { generation_id: id });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Saved Generations</h1>
        <div className="relative flex-1 max-w-xl ml-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            placeholder="Search saved generations..."
            className="w-full rounded-md border border-border bg-background pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : savedGenerations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-foreground/70">You don't have any saved generations yet.</p>
          <p className="text-sm mt-2">Fill in variables in a prompt and click "Save Generated Prompt" to create one.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGenerations.map((generation) => {
            const hoverScheme = getRandomHoverScheme();
            const isEditing = editingId === generation.id;

            return (
              <div
                key={generation.id}
                className={`group rounded-lg border border-border bg-background p-4 transition-all relative hover:border-[${hoverScheme.text}]`}
                style={{
                  ['--hover-bg' as string]: hoverScheme.bg,
                  ['--hover-text' as string]: hoverScheme.text,
                }}
              >
                {!isEditing && (
                  <div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEditing(generation)}
                      title="Edit generation"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {generation.original_prompt_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleViewOriginalPrompt(e, generation.original_prompt_id!)}
                        title="View original prompt"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive/90"
                      onClick={(e) => handleDeleteGeneration(e, generation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Content</label>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={5}
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={cancelEditing}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => saveEdits(generation.id)}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold mb-2 text-foreground group-hover:text-[var(--hover-text)]">{generation.title}</h3>
                    <p className="text-sm text-foreground/70 line-clamp-3 group-hover:text-[var(--hover-text)]">
                      {generation.content}
                    </p>
                    <div className="mt-4 flex flex-col gap-1 text-xs text-foreground/60">
                      <span>Generated on {new Date(generation.created_at).toLocaleDateString()}</span>
                      {generation.original_prompt?.title && (
                        <span>From: {generation.original_prompt.title}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
