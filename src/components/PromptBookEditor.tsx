import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Button } from './ui/button';
import { ArrowLeft, Save, Globe, Share2, AlertTriangle } from 'lucide-react';

export function PromptBookEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { promptBooks, prompts, updatePromptBook, fetchPromptBooks, fetchPrompts, addPromptToBook, removePromptFromBook, togglePublicAccess } = useStore();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isPublic, setIsPublic] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [selectedPrompts, setSelectedPrompts] = React.useState<Set<string>>(new Set());
  const [showPublicWarning, setShowPublicWarning] = React.useState(false);
  const [privatePrompts, setPrivatePrompts] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const load = async () => {
      await Promise.all([fetchPromptBooks(), fetchPrompts()]);
      setLoading(false);
    };
    load();
  }, [fetchPromptBooks, fetchPrompts]);

  React.useEffect(() => {
    const book = promptBooks.find(b => b.id === id);
    if (book) {
      setTitle(book.title);
      setDescription(book.description || '');
      setIsPublic(book.is_public);
      setSelectedPrompts(new Set(book.prompts?.map(p => p.id) || []));
    }
  }, [id, promptBooks]);

  React.useEffect(() => {
    // Check for private prompts among selected ones
    const privateSet = new Set(
      Array.from(selectedPrompts).filter(id => {
        const prompt = prompts.find(p => p.id === id);
        return prompt && !prompt.is_public;
      })
    );
    setPrivatePrompts(privateSet);
  }, [selectedPrompts, prompts]);

  const handlePromptToggle = (promptId: string) => {
    if (isPublic && !selectedPrompts.has(promptId)) {
      const prompt = prompts.find(p => p.id === promptId);
      if (prompt && !prompt.is_public) {
        setShowPublicWarning(true);
        return;
      }
    }

    const newSelection = new Set(selectedPrompts);
    if (newSelection.has(promptId)) {
      newSelection.delete(promptId);
    } else {
      newSelection.add(promptId);
    }
    setSelectedPrompts(newSelection);
  };

  const handlePublicToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const willBePublic = e.target.checked;
    if (willBePublic && privatePrompts.size > 0) {
      setShowPublicWarning(true);
    } else {
      setIsPublic(willBePublic);
    }
  };

  const handleConfirmPublic = async () => {
    // Make the selected private prompt public
    const promptId = Array.from(selectedPrompts).find(id => {
      const prompt = prompts.find(p => p.id === id);
      return prompt && !prompt.is_public;
    });
    
    if (promptId) {
      await togglePublicAccess(promptId, true);
      const newSelection = new Set(selectedPrompts);
      newSelection.add(promptId);
      setSelectedPrompts(newSelection);
    }
    setShowPublicWarning(false);
  };

  const handleSave = async () => {
    // Check if we need to make any prompts public
    if (isPublic) {
      for (const promptId of privatePrompts) {
        await togglePublicAccess(promptId, true);
      }
    }

    if (id) {
      // Update the book details
      await updatePromptBook(id, {
        title,
        description,
        is_public: isPublic,
      });

      // Update prompt associations
      const book = promptBooks.find(b => b.id === id);
      const currentPrompts = new Set(book?.prompts?.map(p => p.id) || []);
      
      // Remove prompts that were unselected
      for (const promptId of currentPrompts) {
        if (!selectedPrompts.has(promptId)) {
          await removePromptFromBook(id, promptId);
        }
      }
      
      // Add newly selected prompts
      let order = book?.prompts?.length || 0;
      for (const promptId of selectedPrompts) {
        if (!currentPrompts.has(promptId)) {
          await addPromptToBook(id, promptId, order++);
        }
      }

      navigate('/books');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const book = promptBooks.find(b => b.id === id);
  if (!book) {
    return <div>Book not found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/books')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-semibold flex-1">Edit Prompt Book</h2>
        {book.is_public && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const url = `${window.location.origin}/share/book/${book.share_id}`;
              navigator.clipboard.writeText(url);
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Copy Share Link
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Prompts
          </label>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {prompts.map((prompt) => (
              <label
                key={prompt.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPrompts.has(prompt.id)}
                  onChange={() => handlePromptToggle(prompt.id)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <div className="flex-1">
                  <div className="font-medium">{prompt.title}</div>
                  <div className="text-sm text-foreground/70 line-clamp-2">
                    {prompt.content}
                  </div>
                </div>
                {prompt.is_public && (
                  <Globe className="h-4 w-4 text-foreground/60 flex-shrink-0" />
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Make Public
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isPublic}
              onChange={handlePublicToggle}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {showPublicWarning && (
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-500">Make Prompts Public</h4>
                <p className="mt-1 text-sm text-yellow-500/90">
                  Making this book public will also make {privatePrompts.size} private prompt{privatePrompts.size !== 1 ? 's' : ''} public.
                  This means anyone with the link will be able to view these prompts.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPublicWarning(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmPublic}
                  >
                    Make Public
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}