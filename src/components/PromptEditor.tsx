import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Button } from './ui/button';
import { getVariableHighlightClass, validatePromptContent } from '@/lib/utils';
import { Save, ArrowLeft, Info, Copy, Check, FolderOpen, Trash2, History, Share2, Globe, Download } from 'lucide-react';
import { VersionHistory } from './VersionHistory';
import posthog from 'posthog-js';

const AUTOSAVE_DELAY = 1000; // 1 second delay

export function PromptEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { prompts, categories, updatePrompt, deletePrompt, fetchCategories, fetchPrompts, autoSave, togglePublicAccess, createSavedGeneration } = useStore();
  const prompt = prompts.find(p => p.id === id);
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [variables, setVariables] = React.useState<string[]>([]);
  const [variableValues, setVariableValues] = React.useState<Record<string, string>>({});
  const [copied, setCopied] = React.useState(false);
  const [showVersionHistory, setShowVersionHistory] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [savedGenerated, setSavedGenerated] = React.useState(false);

  // Fetch initial data
  React.useEffect(() => {
    Promise.all([fetchPrompts(), fetchCategories()]);
  }, [fetchPrompts, fetchCategories]);

  // Update form when prompt data is loaded
  React.useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setContent(prompt.content);
      setCategoryId(prompt.category_id || '');
      setHasChanges(false);
    }
  }, [prompt]);

  // Track changes
  React.useEffect(() => {
    if (!prompt) return;
    
    const hasContentChanged = content !== prompt.content;
    const hasTitleChanged = title !== prompt.title;
    const hasCategoryChanged = categoryId !== prompt.category_id;
    
    setHasChanges(hasContentChanged || hasTitleChanged || hasCategoryChanged);
  }, [prompt, title, content, categoryId]);

  const handleCopy = async () => {
    let result = content;
    Object.entries(variableValues).forEach(([variable, value]) => {
      result = result.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), value || `[${variable}]`);
    });
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveGenerated = async () => {
    if (!prompt) return;
    
    // Generate the filled prompt content
    let filledContent = content;
    const filledVariables: Record<string, string> = {};
    
    Object.entries(variableValues).forEach(([variable, value]) => {
      filledContent = filledContent.replace(
        new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), 
        value || `[${variable}]`
      );
      filledVariables[variable] = value || '';
    });
    
    // Save to database
    const savedGeneration = await createSavedGeneration({
      title: `${title} (Generated)`,
      content: filledContent,
      original_prompt_id: prompt.id,
      variables: filledVariables,
    });
    
    if (savedGeneration) {
      posthog.capture('prompt:save_generated', {
        original_prompt_id: prompt.id,
        generation_id: savedGeneration.id,
        variables_count: Object.keys(filledVariables).length,
        content_length: filledContent.length
      });
      
      setSavedGenerated(true);
      setTimeout(() => setSavedGenerated(false), 2000);
    }
  };

  React.useEffect(() => {
    // Extract variables from content using regex
    const matches = content.match(/\{\{([^}]+)\}\}/g) || [];
    const extractedVars = matches.map(match => match.slice(2, -2).trim());
    const uniqueVars = [...new Set(extractedVars)];

    // Only update if variables have changed
    if (JSON.stringify(uniqueVars) !== JSON.stringify(variables)) {
      setVariables(uniqueVars);
      
      // Update variable values, preserving existing values
      setVariableValues(prev => {
        const newValues: Record<string, string> = {};
        uniqueVars.forEach(variable => {
          newValues[variable] = prev[variable] || '';
        });
        return newValues;
      });
    }
  }, [content, variables]);

  // Auto-save functionality
  React.useEffect(() => {
    if (!autoSave || !prompt) return;

    const timer = setTimeout(() => {
      const validation = validatePromptContent(content);
      if (!validation.isValid) {
        setValidationError(validation.errors[0]);
        return;
      }
      setValidationError(null);
      
      updatePrompt(prompt.id, {
        title,
        content,
        variables,
        category_id: categoryId || null,
      });
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timer);
  }, [title, content, categoryId, autoSave, prompt, updatePrompt, variables]);

  const handleSave = async () => {
    if (prompt) {
      const validation = validatePromptContent(content);
      if (!validation.isValid) {
        setValidationError(validation.errors[0]);
        return;
      }
      setValidationError(null);

      await updatePrompt(prompt.id, {
        title,
        content,
        variables,
        category_id: categoryId || null,
      });
      posthog.capture('prompt:save_edit', {
        prompt_id: prompt.id,
        category_id: categoryId || null,
        variables_count: variables.length,
        content_length: content.length
      });
      navigate('/');
    }
  };

  const handleDelete = async () => {
    if (prompt && confirm('Are you sure you want to delete this prompt?')) {
      await deletePrompt(prompt.id);
      posthog.capture('prompt:delete', {
        prompt_id: prompt.id,
        category_id: categoryId || null
      });
      navigate('/');
    }
  };

  if (!prompt) {
    return <div>Prompt not found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-semibold flex-1">Edit Prompt</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowVersionHistory(true);
            posthog.capture('prompt:history_view', {
              prompt_id: prompt.id
            });
          }}
          className="mr-2"
        >
          <History className="h-4 w-4 mr-2" />
          Version History
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            if (prompt) {
              const newState = !prompt.is_public;
              await togglePublicAccess(prompt.id, newState);
              posthog.capture('prompt:visibility_update', {
                prompt_id: prompt.id,
                is_public: newState
              });
              if (newState) {
                const url = `${window.location.origin}/share/${prompt.share_id}`;
                navigator.clipboard.writeText(url);
                posthog.capture('prompt:link_copy', {
                  prompt_id: prompt.id
                });
              }
            }
          }}
          className="mr-2"
        >
          {prompt?.is_public ? (
            <>
              <Globe className="h-4 w-4 mr-2" />
              Public
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4 mr-2" />
              Make Public
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="ml-auto text-destructive hover:text-destructive/90"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <div className="relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          {autoSave && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground/60">
              Auto-saving...
            </div>
          )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Category
          </label>
          <div className="relative">
            <FolderOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-md border border-border bg-background pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 appearance-none"
            >
              <option value="">No Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full rounded-md border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
          />
          {validationError && (
            <div className="mt-2 text-sm text-destructive flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{validationError}</p>
            </div>
          )}
          <div className="mt-2 text-sm text-foreground/70 flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p>Use <code className="bg-secondary text-foreground px-1.5 py-0.5 rounded font-mono text-sm">{"{{variable_name}}"}</code> syntax for variables.</p>
              {variables.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Detected variables:</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {variables.map((variable, index) => (
                      <span key={variable} className={`${getVariableHighlightClass(index)} px-2 py-1 rounded-md text-xs`}>
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {variables.length > 0 && (
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="text-lg font-medium mb-4">Generate Prompt</h3>
            <div className="mb-6 rounded-md bg-secondary/50 p-4 font-mono text-sm whitespace-pre-wrap text-foreground">
              {content.split(/(\{\{[^}]+\}\})/).map((part, i) => {
                if (part.startsWith('{{') && part.endsWith('}}')) {
                  const variable = part.slice(2, -2).trim();
                  const value = variableValues[variable];
                  return (
                    <mark key={i} className={`${getVariableHighlightClass(variables.indexOf(variable))} font-medium rounded px-1`}>
                      {value || `[${variable}]`}
                    </mark>
                  );
                }
                return <span key={i}>{part}</span>;
              })}
            </div>
            <div className="space-y-4">
              {variables.map((variable) => (
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
                    className="w-full rounded-md border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    placeholder={`Enter value for ${variable}`}
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <Button onClick={handleCopy} className="flex-1">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Generated Prompt
                    </>
                  )}
                </Button>
                <Button onClick={handleSaveGenerated} className="flex-1">
                  {savedGenerated ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Save Generated Prompt
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!hasChanges || validationError !== null}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
      {showVersionHistory && (
        <VersionHistory
          promptId={prompt.id}
          onClose={() => setShowVersionHistory(false)}
          currentVersion={prompt.version}
          currentContent={content}
          onRestore={(version) => {
            setContent(version.content);
            setShowVersionHistory(false);
          }}
        />
      )}
    </div>
  );
}