import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, Prompt, PromptBook } from '@/lib/store';
import { Button } from './ui/button';
import { getVariableHighlightClass } from '@/lib/utils';
import { Copy, Check, BookMarked, BookOpen, Share2, ArrowLeft } from 'lucide-react';
import posthog from 'posthog-js';
import { ShareHeader } from './ShareHeader';

export function ShareBook() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { getPublicPromptBook, user } = useStore();
  const [book, setBook] = React.useState<PromptBook | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const handlePromptClick = (prompt: Prompt) => {
    posthog.capture('book:prompt_click', {
      prompt_id: prompt.id,
      book_id: bookId
    });
    navigate(`/share/book/${bookId}/prompt/${prompt.id}`);
  };

  React.useEffect(() => {
    const loadBook = async () => {
      if (bookId) {
        try {
          const data = await getPublicPromptBook(bookId);
          if (!data) {
            setError('This prompt book is no longer available');
            posthog.capture('book:not_found', {
              book_id: bookId
            });
          } else {
            setBook(data);
            posthog.capture('book:page_view', {
              book_id: bookId,
              prompt_count: data.prompts?.length || 0
            });
          }
        } catch (err) {
          setError((err as Error).message);
        }
        setLoading(false);
      }
    };
    loadBook();
  }, [bookId, getPublicPromptBook]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground/60">Loading...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {!user && <ShareHeader />}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <BookOpen className="h-12 w-12 text-primary mx-auto" />
            <div className="text-foreground">{error || 'This prompt book is no longer available'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">{book.title}</h1>
        </div>

        {book.description && (
          <p className="text-foreground/70">{book.description}</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {book.prompts?.map((prompt: Prompt) => (
            <div
              key={prompt.id}
              className="group rounded-lg border border-border bg-background p-4 hover:border-blue-600 dark:hover:border-blue-400 transition-colors cursor-pointer relative"
              onClick={() => handlePromptClick(prompt)}
            >
              <div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = `${window.location.origin}/share/${prompt.share_id}`;
                    navigator.clipboard.writeText(url);
                    posthog.capture('prompt:share_link_copy', {
                      prompt_id: prompt.id,
                      from_book: true,
                      book_id: bookId
                    });
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-semibold mb-2 text-foreground">{prompt.title}</h3>
              <p className="text-sm text-foreground/70 line-clamp-3">
                {prompt.content.split(/(\{\{[^}]+\}\})/).map((part, i) => {
                  if (part.startsWith('{{') && part.endsWith('}}')) {
                    const variable = part.slice(2, -2).trim();
                    const variables = prompt.content.match(/\{\{([^}]+)\}\}/g)?.map(v => v.slice(2, -2).trim()) || [];
                    const variableIndex = variables.indexOf(variable);
                    return (
                      <mark key={i} className={`${getVariableHighlightClass(variableIndex)} font-medium rounded px-1`}>
                        {variable}
                      </mark>
                    );
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
          ))}
        </div>
      </div>
    </div>
  );
}

export function Share() {
  const { shareId, bookId, promptId } = useParams();
  const navigate = useNavigate();
  const { getPublicPrompt, getPublicPromptBook, createPrompt, user } = useStore();
  const [prompt, setPrompt] = React.useState<Prompt | null>(null);
  const [book, setBook] = React.useState<PromptBook | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [variableValues, setVariableValues] = React.useState<Record<string, string>>({});
  const [duplicateLoading, setDuplicateLoading] = React.useState(false);
  const [duplicateError, setDuplicateError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      if (shareId || promptId) {
        try {
          const data = await getPublicPrompt(shareId || promptId || '');
          if (!data) {
            setError('This prompt is no longer available');
            posthog.capture('prompt:not_found', {
              prompt_id: shareId || promptId,
              from_book: !!bookId,
              book_id: bookId
            });
          } else {
            setPrompt(data);
            const isOwnPrompt = user && user.id === data.user_id;
            posthog.capture(isOwnPrompt ? 'prompt:page_view_own' : 'prompt:page_view', {
              prompt_id: data.id,
              from_book: !!bookId,
              book_id: bookId,
              has_variables: (data.content.match(/\{\{([^}]+)\}\}/g) || []).length > 0
            });
            if (bookId) {
              const bookData = await getPublicPromptBook(bookId);
              if (bookData) {
                setBook(bookData);
              }
            }
          }
        } catch (err) {
          setError((err as Error).message);
        }
        setLoading(false);
      }
    };
    loadData();
  }, [shareId, promptId, bookId, getPublicPrompt, getPublicPromptBook, user]);

  const handleCopy = async () => {
    if (!prompt) return;
    let result = prompt.content;
    Object.entries(variableValues).forEach(([variable, value]) => {
      result = result.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), value || `[${variable}]`);
    });
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    posthog.capture('prompt:content_copy', {
      prompt_id: prompt.id,
      from_book: !!bookId,
      book_id: bookId,
      variables_filled: Object.values(variableValues).every(v => v !== '')
    });
  };

  const handleDuplicate = async () => {
    if (!prompt) return;
    setDuplicateLoading(true);
    try {
      const newPrompt = await createPrompt({
        title: prompt.title,
        content: prompt.content,
        variables: prompt.variables,
        category_id: null,
        is_public: false,
      });
      if (newPrompt) {
        posthog.capture('prompt:content_duplicate', {
          original_prompt_id: prompt.id,
          new_prompt_id: newPrompt.id,
          from_book: !!bookId,
          book_id: bookId
        });
        navigate(`/prompt/${newPrompt.id}`);
      }
    } catch (error) {
      console.error('Error duplicating prompt:', error);
      setDuplicateError('Failed to duplicate prompt');
    } finally {
      setDuplicateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground/60">Loading...</div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {!user && <ShareHeader />}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <BookMarked className="h-12 w-12 text-primary mx-auto" />
            <div className="text-foreground">{error || 'This prompt is no longer available'}</div>
          </div>
        </div>
      </div>
    );
  }

  const variables = (prompt.content.match(/\{\{([^}]+)\}\}/g) || [])
    .map((match: string) => match.slice(2, -2).trim())
    .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!user && <ShareHeader />}
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {bookId && (
            <div className="mb-6">
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-foreground hover:text-foreground/90"
                onClick={() => navigate(`/share/book/${bookId}`)}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to {book?.title || 'Book'}</span>
              </Button>
            </div>
          )}
          <div className="flex items-center gap-4">
            <BookMarked className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{prompt.title}</h1>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <pre className="whitespace-pre-wrap text-foreground font-mono text-sm">
              {prompt.content.split(/(\{\{[^}]+\}\})/).map((part, i) => {
                if (part.startsWith('{{') && part.endsWith('}}')) {
                  const variable = part.slice(2, -2).trim();
                  const variables = prompt.content.match(/\{\{([^}]+)\}\}/g)?.map(v => v.slice(2, -2).trim()) || [];
                  const variableIndex = variables.indexOf(variable);
                  const value = variableValues[variable];
                  return (
                    <mark key={i} className={`${getVariableHighlightClass(variableIndex)} font-medium rounded px-1`}>
                      {value || `[${variable}]`}
                    </mark>
                  );
                }
                return <span key={i}>{part}</span>;
              })}
            </pre>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2 text-foreground"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </Button>
              {user && prompt && user.id !== prompt.user_id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDuplicate}
                  className="flex items-center gap-2 text-foreground"
                  disabled={duplicateLoading}
                >
                  <BookMarked className="h-4 w-4" />
                  <span>Duplicate to My Library</span>
                </Button>
              )}
              {duplicateError && (
                <div className="text-red-600 text-sm mt-2">{duplicateError}</div>
              )}
            </div>
          </div>

          {variables.length > 0 && (
            <div className="rounded-lg border border-border bg-background p-4">
              <h2 className="text-lg font-medium mb-4 text-foreground">Generate Prompt</h2>
              <div className="space-y-4">
                {variables.map((variable: string) => (
                  <div key={variable}>
                    <label className="block text-sm font-medium mb-1">
                      <span className={`${getVariableHighlightClass(variables.indexOf(variable))} rounded px-2 py-0.5`}>
                        {variable}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={variableValues[variable] || ''}
                      onChange={(e) => setVariableValues(prev => ({
                        ...prev,
                        [variable]: e.target.value
                      }))}
                      className="w-full rounded-md border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                      placeholder={`Enter value for ${variable}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}