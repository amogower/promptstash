import { create } from 'zustand';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface Prompt {
  id: string;
  title: string;
  content: string;
  version: number;
  variables: string[];
  category_id: string | null;
  is_public: boolean;
  share_id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface PromptBook {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  share_id: string;
  created_at: string;
  updated_at: string;
  prompts?: Prompt[];
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  content: string;
  version: number;
  created_at: string;
  created_by: string;
}

export interface SavedGeneration {
  id: string;
  title: string;
  content: string;
  original_prompt_id: string | null;
  variables: Record<string, string>;
  created_at: string;
  updated_at: string;
  user_id: string;
  original_prompt?: Prompt;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface PromptStore {
  prompts: Prompt[];
  promptBooks: PromptBook[];
  categories: Category[];
  savedGenerations: SavedGeneration[];
  user: User | null;
  selectedPrompt: Prompt | null;
  loading: boolean;
  error: string | null;
  isDarkMode: boolean;
  autoSave: boolean;
  toggleDarkMode: () => void;
  fetchPromptBooks: () => Promise<void>;
  createPromptBook: (book: Partial<PromptBook>) => Promise<PromptBook>;
  updatePromptBook: (id: string, updates: Partial<PromptBook>) => Promise<void>;
  deletePromptBook: (id: string) => Promise<void>;
  addPromptToBook: (bookId: string, promptId: string, order: number) => Promise<void>;
  removePromptFromBook: (bookId: string, promptId: string) => Promise<void>;
  getPublicPromptBook: (shareId: string) => Promise<PromptBook | null>;
  updateSettings: (settings: {
    autoSave?: boolean;
    isDarkMode?: boolean;
  }) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithGitLab: () => Promise<void>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
  fetchPrompts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchSavedGenerations: () => Promise<void>;
  createPrompt: (prompt: Partial<Prompt>) => Promise<Prompt | undefined>;
  createCategory: (category: { name: string; description?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updatePrompt: (id: string, updates: Partial<Prompt>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  createSavedGeneration: (generation: Partial<SavedGeneration>) => Promise<SavedGeneration | undefined>;
  updateSavedGeneration: (id: string, updates: Partial<SavedGeneration>) => Promise<void>;
  deleteSavedGeneration: (id: string) => Promise<void>;
  setSelectedPrompt: (prompt: Prompt | null) => void;
  togglePublicAccess: (id: string, isPublic: boolean) => Promise<void>;
  getPublicPrompt: (shareId: string) => Promise<Prompt | null>;
  fetchVersions: (promptId: string) => Promise<PromptVersion[]>;
  rollbackToVersion: (promptId: string, version: PromptVersion) => Promise<void>;
  exportPrompts: () => void;
  importPrompts: (file: File) => Promise<void>;
}

export const useStore = create<PromptStore>((set, get) => ({
  prompts: [],
  categories: [],
  promptBooks: [],
  savedGenerations: [],
  user: null,
  selectedPrompt: null,
  loading: false,
  error: null,
  isDarkMode: (() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  })(),
  autoSave: false, // Default to false

  toggleDarkMode: () => {
    set((state) => {
      const newDarkMode = !state.isDarkMode;
      localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
      return { isDarkMode: newDarkMode };
    });
  },

  updateSettings: (settings) => {
    if (settings.autoSave !== undefined) {
      localStorage.setItem('autoSave', String(settings.autoSave));
    }

    set((state) => ({
      ...state,
      ...settings,
    }));
  },

  checkUser: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (session && user) {
        set({ user });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      set({ user: null });
    }
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    await get().checkUser();
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  },

  signInWithGitHub: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  },

  signInWithGitLab: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'gitlab',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },

  fetchPrompts: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.from('prompts')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ prompts: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ categories: data });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  fetchSavedGenerations: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('saved_generations')
        .select(`
          *,
          original_prompt:prompts(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ savedGenerations: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createCategory: async (category) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ categories: [...state.categories, data] }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteCategory: async (id) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  createPrompt: async (prompt): Promise<Prompt | undefined> => {
    set({ loading: true, error: null });
    try {
      const newPrompt = { ...prompt, version: 0 };
      const { data, error } = await supabase.from('prompts')
        .insert([newPrompt])
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .single();

      if (error) throw error;
      set((state) => ({ prompts: [data, ...state.prompts] }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }

    return undefined;
  },

  createSavedGeneration: async (generation): Promise<SavedGeneration | undefined> => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('saved_generations')
        .insert([generation])
        .select(`
          *,
          original_prompt:prompts(*)
        `)
        .single();

      if (error) throw error;
      set((state) => ({ savedGenerations: [data, ...state.savedGenerations] }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
    return undefined;
  },

  updateSavedGeneration: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('saved_generations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          original_prompt:prompts(*)
        `)
        .single();

      if (error) throw error;
      set((state) => ({
        savedGenerations: state.savedGenerations.map((g) => (g.id === id ? data : g)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  deleteSavedGeneration: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('saved_generations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      set((state) => ({
        savedGenerations: state.savedGenerations.filter((g) => g.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updatePrompt: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      // Get current prompt to check if content changed
      const { data: currentPrompt } = await supabase
        .from('prompts')
        .select('content, version')
        .eq('id', id)
        .single();

      // Only increment version if content changed
      const newVersion = updates.content !== currentPrompt?.content
        ? (currentPrompt?.version || 0) + 1
        : currentPrompt?.version || 0;

      const { data, error } = await supabase.from('prompts')
        .update({ ...updates, version: newVersion })
        .eq('id', id)
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .single();

      if (error) throw error;
      set((state) => ({
        prompts: state.prompts.map((p) => (p.id === id ? data : p)),
      }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  deletePrompt: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('prompts').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({
        prompts: state.prompts.filter((p) => p.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchVersions: async (promptId: string) => {
    try {
      const { data, error } = await supabase
        .from('prompt_versions')
        .select('*')
        .eq('prompt_id', promptId)
        .order('version', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      set({ error: (error as Error).message });
      return [];
    }
  },

  rollbackToVersion: async (promptId: string, version: PromptVersion) => {
    try {
      const { data: prompt } = await supabase
        .from('prompts')
        .select('version')
        .eq('id', promptId)
        .single();

      const { data, error } = await supabase
        .from('prompts')
        .update({
          content: version.content,
          version: (prompt?.version || 0) + 1,
        })
        .eq('id', promptId)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        prompts: state.prompts.map((p) => (p.id === promptId ? data : p)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  setSelectedPrompt: (prompt) => set({ selectedPrompt: prompt }),

  togglePublicAccess: async (id, isPublic) => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .update({ is_public: isPublic })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        prompts: state.prompts.map((p) => (p.id === id ? data : p)),
      }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  getPublicPrompt: async (shareId) => {
    try {
      const { data, error } = await supabase
        .from('prompts').select('*')
        .or(`share_id.eq.${shareId},id.eq.${shareId}`)
        .eq('is_public', true).single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching public prompt:', error);
      return null;
    }
  },

  fetchPromptBooks: async () => {
    try {
      const { data, error } = await supabase
        .from('prompt_books')
        .select(`
          *,
          prompts:prompt_book_items(
            prompt:prompts(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const books = data.map((book: PromptBook) => ({
        ...book,
        prompts: book.prompts?.map((item: Prompt) => item).filter(Boolean)
      }));
      
      set({ promptBooks: books });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  createPromptBook: async (book) => {
    try {
      const { data, error } = await supabase
        .from('prompt_books')
        .insert([book])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ promptBooks: [data, ...state.promptBooks] }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updatePromptBook: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('prompt_books')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        promptBooks: state.promptBooks.map((b) => (b.id === id ? data : b)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deletePromptBook: async (id) => {
    try {
      const { error } = await supabase
        .from('prompt_books')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        promptBooks: state.promptBooks.filter((b) => b.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addPromptToBook: async (bookId, promptId, order) => {
    try {
      const { error } = await supabase
        .from('prompt_book_items')
        .insert([{ book_id: bookId, prompt_id: promptId, order }]);

      if (error) throw error;
      await get().fetchPromptBooks();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  removePromptFromBook: async (bookId, promptId) => {
    try {
      const { error } = await supabase
        .from('prompt_book_items')
        .delete()
        .eq('book_id', bookId)
        .eq('prompt_id', promptId);

      if (error) throw error;
      await get().fetchPromptBooks();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  getPublicPromptBook: async (shareId) => {
    try {
      const { data, error } = await supabase
        .from('prompt_books').select(`
          *,
          prompts:prompt_book_items(
            prompt:prompts(*)
          )
        `)
        .or(`share_id.eq.${shareId},id.eq.${shareId}`)
        .eq('is_public', true)
        .single();

      if (error) throw error;
      return {
        ...data,
        prompts: data.prompts?.map((item: Prompt) => item).filter(Boolean)
      };
    } catch (error) {
      console.error('Error fetching public prompt book:', error);
      return null;
    }
  },

  exportPrompts: () => {
    const { prompts } = get();
    const data = JSON.stringify(prompts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importPrompts: async (file: File) => {
    try {
      const text = await file.text();
      const prompts = JSON.parse(text);
      
      if (!Array.isArray(prompts)) {
        throw new Error('Invalid import format');
      }

      // Validate and import each prompt
      for (const prompt of prompts) {
        await get().createPrompt({
          title: prompt.title || 'Imported Prompt',
          content: prompt.content || '',
          variables: prompt.variables || [],
        });
      }
    } catch (error) {
      throw new Error('Failed to import prompts: ' + (error as Error).message);
    }
  },
}));
