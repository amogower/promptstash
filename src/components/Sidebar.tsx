import React from 'react';
import { FolderOpen, Hash, Settings, Plus, Trash2, BookOpen } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { categories, fetchCategories, createCategory, deleteCategory } = useStore();
  const navigate = useNavigate();
  const [newCategory, setNewCategory] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateCategory = async () => {
    if (newCategory.trim()) {
      await createCategory({ name: newCategory.trim() });
      setNewCategory('');
      setIsAdding(false);
    }
  };

  const handleDeleteCategory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(id);
    }
  };

  return (
    <div className="w-64 h-[calc(100vh-4rem)] border-r border-border bg-background p-4 overflow-y-auto">
      <nav className="space-y-2">
        <Button
          variant="ghost"
          onClick={() => handleNavigate('/prompts')}
          className="w-full justify-start gap-2"
        >
          <FolderOpen className="h-4 w-4" />
          All Prompts
        </Button>
        <Button
          variant="ghost"
          onClick={() => handleNavigate('/books')}
          className="w-full justify-start gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Prompt Books
        </Button>
        <div className="py-2">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-sm font-semibold text-foreground/60">
              Categories
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {isAdding && (
            <div className="mb-2 px-2 flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Category name"
                className="flex-1 text-sm rounded border border-border bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateCategory();
                  if (e.key === 'Escape') setIsAdding(false);
                }}
              />
              <Button
                size="sm"
                className="h-6 px-2 py-0"
                onClick={handleCreateCategory}
              >
                Add
              </Button>
            </div>
          )}
          {categories.map((category) => (
            <div key={category.id} className="group relative">
              <Button
                variant="ghost"
                onClick={() => handleNavigate(`/prompts/category/${category.id}`)}
                className="w-full justify-start gap-2"
              >
                <Hash className="h-4 w-4" />
                {category.name}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                onClick={(e) => handleDeleteCategory(category.id, e)}
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-4">
          <Button
            variant="ghost"
            onClick={() => handleNavigate('/settings')}
            className="w-full justify-start gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </nav>
    </div>
  );
}