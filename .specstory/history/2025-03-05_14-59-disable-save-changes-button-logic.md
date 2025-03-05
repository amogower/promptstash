## SpecStory

## Disable Save Changes Button Logic (05/03/2025, 14:59:11)

_**User**_

Disable the Save Changes button in the prompt editor unless there are changes to be saved. 

---

_**Assistant**_

I'll help you implement this feature. We'll need to track whether there are unsaved changes by comparing the current values with the original prompt values.

First, let me search for any existing state management related to changes.

---

_****_

<details>
            <summary>Searched codebase "updatePrompt state management in PromptEditor" • **25** results</summary>
        
| File | Lines |
|------|-------|
| `src/components/PromptEditor.tsx` | L37-107 |
| `src/components/PromptEditor.tsx` | L1-37 |
| `src/lib/store.ts` | L223-289 |
| `src/components/PromptBookEditor.tsx` | L1-46 |
| `src/components/PromptBookEditor.tsx` | L89-137 |
| `src/components/PromptEditor.tsx` | L262-318 |
| `src/components/PromptBookEditor.tsx` | L46-89 |
| `src/lib/store.ts` | L425-487 |
| `src/lib/store.ts` | L289-349 |
| `src/components/PromptEditor.tsx` | L208-244 |
| `src/components/PromptEditor.tsx` | L318-321 |
| `src/components/PromptEditor.tsx` | L167-208 |
| `src/components/PromptEditor.tsx` | L107-167 |
| `src/lib/store.ts` | L349-425 |
| `src/lib/store.ts` | L1-16 |
| `src/lib/store.ts` | L42-84 |
| `src/components/PromptBookEditor.tsx` | L188-218 |
| `src/components/PromptBookEditor.tsx` | L233-274 |
| `src/components/PromptEditor.tsx` | L244-262 |
| `src/lib/store.ts` | L27-36 |
| `src/lib/store.ts` | L16-27 |
| `src/lib/store.ts` | L84-156 |
| `src/components/PromptBookEditor.tsx` | L137-188 |
| `src/components/VersionHistory.tsx` | L1-12 |
| `src/components/Share.tsx` | L120-175 |

</details>

---

_****_

Based on the search results, I can see that we need to track whether there are unsaved changes by comparing the current state with the original prompt values. I'll implement this feature by adding a state variable to track changes and use it to disable the Save Changes button when there are no changes.

I'll edit the `PromptEditor.tsx` file:

---

_****_

```diff
    const [showVersionHistory, setShowVersionHistory] = React.useState(false);
    const [validationError, setValidationError] = React.useState<string | null>(null);
+   const [hasChanges, setHasChanges] = React.useState(false);
  
    React.useEffect(() => {
      fetchCategories();
    }, [fetchCategories]);
+ 
+   // Track changes
+   React.useEffect(() => {
+     if (!prompt) return;
+     
+     const hasContentChanged = content !== prompt.content;
+     const hasTitleChanged = title !== prompt.title;
+     const hasCategoryChanged = categoryId !== prompt.category_id;
+     
+     setHasChanges(hasContentChanged || hasTitleChanged || hasCategoryChanged);
+   }, [prompt, title, content, categoryId]);
  
    const handleCopy = async () => {
  
          <div className="flex justify-end">
-           <Button onClick={handleSave}>
+           <Button onClick={handleSave} disabled={!hasChanges || validationError !== null}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
```

---

_****_

I've made the following changes to implement the feature:

1. Added a new state variable `hasChanges` to track whether there are unsaved changes
2. Added a new `useEffect` hook that compares the current values (title, content, categoryId) with the original prompt values
3. Updated the Save Changes button to be disabled when there are no changes (`!hasChanges`) or when there's a validation error

The button will now be disabled in the following cases:
- When there are no changes to save (all fields match the original prompt)
- When there's a validation error in the content
- When the prompt is not found

The button will be enabled when:
- Any of the fields (title, content, or category) have been modified from their original values
- There are no validation errors

This implementation ensures that users can only save when there are actual changes to be saved, preventing unnecessary save operations and providing better visual feedback about the state of their edits.

---

_**User**_

The Save Changes button in the prompt editor is still clickable, even though I haven't made any changes to an existing prompt. 

---

_**Assistant**_

I notice that the issue might be related to how we're initializing the state and tracking changes. Let me check how the prompt data is loaded and managed.

---

_****_

<details>
            <summary>Searched codebase "fetchPrompts useEffect PromptEditor" • **25** results</summary>
        
| File | Lines |
|------|-------|
| `src/components/PromptBookEditor.tsx` | L1-46 |
| `src/components/PromptEditor.tsx` | L1-39 |
| `src/components/PromptEditor.tsx` | L39-93 |
| `src/lib/store.ts` | L223-289 |
| `src/components/Library.tsx` | L1-32 |
| `src/lib/store.ts` | L289-349 |
| `src/components/PromptBookEditor.tsx` | L89-137 |
| `src/lib/store.ts` | L487-548 |
| `src/components/PromptEditor.tsx` | L93-170 |
| `src/lib/store.ts` | L349-425 |
| `src/lib/store.ts` | L42-84 |
| `src/components/PromptBookEditor.tsx` | L188-218 |
| `src/lib/store.ts` | L156-223 |
| `src/components/PromptEditor.tsx` | L220-256 |
| `src/components/PromptBookEditor.tsx` | L46-89 |
| `src/lib/store.ts` | L425-487 |
| `src/components/PromptEditor.tsx` | L318-333 |
| `src/components/PromptEditor.tsx` | L274-318 |
| `src/components/PromptEditor.tsx` | L170-220 |
| `src/lib/store.ts` | L1-16 |
| `src/lib/store.ts` | L16-27 |
| `src/components/Header.tsx` | L10-42 |
| `src/components/PromptEditor.tsx` | L256-274 |
| `src/components/Library.tsx` | L55-93 |
| `src/lib/store.ts` | L84-156 |

</details>

---

_****_

I see the issue. The problem is that we're not fetching the prompts when the component mounts, which means the initial prompt data might not be available when setting up the state. Let's fix this by adding a `fetchPrompts` call in the `useEffect` hook:

---

_****_



---

_****_



---



---

