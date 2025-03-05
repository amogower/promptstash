import React from 'react';
import { useStore, PromptVersion } from '@/lib/store';
import { Button } from './ui/button';
import { X, RotateCcw } from 'lucide-react';

interface VersionHistoryProps {
  promptId: string;
  onClose: () => void;
  currentVersion: number;
  currentContent: string;
  onRestore: (version: { content: string }) => void;
}

export function VersionHistory({
  promptId,
  onClose,
  currentVersion,
  currentContent,
  onRestore,
}: VersionHistoryProps) {
  const { fetchVersions, rollbackToVersion } = useStore();
  const [versions, setVersions] = React.useState<PromptVersion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedVersion, setSelectedVersion] = React.useState<number | null>(null);

  React.useEffect(() => {
    const loadVersions = async () => {
      const data = await fetchVersions(promptId);
      setVersions(data);
      setLoading(false);
    };
    loadVersions();
  }, [fetchVersions, promptId]);

  const handleRestore = async (version: PromptVersion) => {
    await rollbackToVersion(promptId, version);
    onRestore(version);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold">Version History</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading versions...</div>
          ) : (
            <>
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg border ${
                    selectedVersion === null
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => setSelectedVersion(null)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">Current Version</span>
                      <span className="ml-2 text-sm text-foreground/60">
                        v{currentVersion}
                      </span>
                    </div>
                  </div>
                  <pre className="text-sm font-mono bg-secondary p-2 rounded overflow-x-auto">
                    {currentContent}
                  </pre>
                </div>

                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={`p-4 rounded-lg border ${
                      selectedVersion === version.version
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                    onClick={() => setSelectedVersion(version.version)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium">Version {version.version}</span>
                        <span className="ml-2 text-sm text-foreground/60">
                          {new Date(version.created_at).toLocaleString()}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(version);
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                    </div>
                    <pre className="text-sm font-mono bg-secondary p-2 rounded overflow-x-auto">
                      {version.content}
                    </pre>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}