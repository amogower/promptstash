import React from 'react';
import { useStore } from '@/lib/store';
import { getRandomHoverScheme } from '@/lib/utils';
import { Button } from './ui/button';
import { BookOpen, Plus, Trash2, Share2, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PromptBooks() {
  const { promptBooks, fetchPromptBooks, createPromptBook, deletePromptBook } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      await fetchPromptBooks();
      setLoading(false);
    };
    load();
  }, [fetchPromptBooks]);

  const handleCreateBook = async () => {
    const book = await createPromptBook({
      title: 'New Prompt Book',
      description: '',
      is_public: false,
    });
    navigate(`/books/${book.id}`);
  };

  const handleDeleteBook = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this prompt book?')) {
      await deletePromptBook(id);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Prompt Books</h1>
        <Button onClick={handleCreateBook}>
          <Plus className="h-4 w-4 mr-2" />
          New Book
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promptBooks.map((book) => {
          const hoverScheme = getRandomHoverScheme();
          return (
            <div
              key={book.id}
              className={`group rounded-lg border border-border bg-background p-4 transition-all cursor-pointer relative hover:border-[${hoverScheme.text}]`}
              style={{
                ['--hover-bg' as string]: hoverScheme.bg,
                ['--hover-text' as string]: hoverScheme.text,
              }}
              onClick={() => navigate(`/books/${book.id}`)}
            >
              <div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100">
                {book.is_public && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = `${window.location.origin}/share/book/${book.share_id}`;
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
                  onClick={(e) => handleDeleteBook(e, book.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-foreground group-hover:text-[var(--hover-text)]">{book.title}</h3>
                {book.is_public && (
                  <Globe className="h-4 w-4 text-foreground/60" />
                )}
              </div>

              {book.description && (
                <p className="text-sm text-foreground/70 mb-3 group-hover:text-[var(--hover-text)]">
                  {book.description.split(/(\{\{[^}]+\}\})/).map((part, i) => {
                    if (part.startsWith('{{') && part.endsWith('}}')) {
                      const variable = part.slice(2, -2).trim();
                      return <mark key={i} className="font-medium rounded px-1 bg-[var(--hover-bg)] text-[var(--hover-text)]">{variable}</mark>;
                    }
                    return <span key={i}>{part}</span>;
                  })}
                </p>
              )}

              <div className="text-xs text-foreground/60">
                {book.prompts?.length || 0} prompts
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}