import React from 'react';
import { Search, Trash2, Share2 } from 'lucide-react';
import { Prompt, useStore } from '@/lib/store';
import { getRandomHoverScheme } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from './ui/button';

export function Library() {
  const { prompts, categories, loading, fetchPrompts, deletePrompt, setSelectedPrompt } = useStore();
  const { id: categoryId } = useParams();
  const navigate = useNavigate();

  const category = categories.find(c => c.id === categoryId);
  const filteredPrompts = categoryId
    ? prompts.filter(p => p.category_id === categoryId)
    : prompts;

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    navigate(`/prompt/${prompt.id}`);
  };

  const handleDeletePrompt = async (e: React.MouseEvent, promptId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this prompt?')) {
      await deletePrompt(promptId);
    }
  };

  React.useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {category && (
          <h2 className="text-lg font-semibold text-foreground">
            {category.name}
          </h2>
        )}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            placeholder="Search prompts..."
            className="w-full rounded-md border border-border bg-background pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map((prompt) => {
            const hoverScheme = getRandomHoverScheme();

            return (
              <div
                key={prompt.id}
                className={`group rounded-lg border border-border bg-background p-4 transition-all cursor-pointer relative hover:border-[${hoverScheme.text}]`}
                style={{
                  ['--hover-bg' as string]: hoverScheme.bg,
                  ['--hover-text' as string]: hoverScheme.text,
                }}
                onClick={() => handlePromptClick(prompt)}
              >
                <div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100">
                  {prompt.is_public && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = `${window.location.origin}/share/${prompt.share_id}`;
                        navigator.clipboard.writeText(url);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive/90"
                    onClick={(e) => handleDeletePrompt(e, prompt.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="font-semibold mb-2 text-foreground group-hover:text-[var(--hover-text)]">{prompt.title}</h3>
                <p className="text-sm text-foreground/70 line-clamp-3 group-hover:text-[var(--hover-text)]">
                  {prompt.content.split(/(\{\{[^}]+\}\})/).map((part, i) => {
                    if (part.startsWith('{{') && part.endsWith('}}')) {
                      const variable = part.slice(2, -2).trim();
                      return <mark key={i} className="font-medium rounded px-1 bg-[var(--hover-bg)] text-[var(--hover-text)]">{variable}</mark>;
                    }
                    return <span key={i}>{part}</span>;
                  })}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-foreground/60">
                  <span>v{prompt.version}</span>
                  <span>•</span>
                  <span>
                    {new Date(prompt.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}