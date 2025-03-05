## SpecStory

## No Prompt Books Notification Setup (05/03/2025, 14:51:35)

_**User**_

Add a message when there are no prompt books for the user to say you have no prompt books create one now with a link to create a new book 

---

_**Assistant**_

I'll help you add a message when there are no prompt books. I'll first check the current code and then make the necessary changes.

I'll modify the `PromptBooks` component to show a message when `promptBooks` is empty. I'll add this before the grid of prompt books.

---

_****_

```diff
        </div>
  
-       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
-         {promptBooks.map((book) => {
-           const hoverScheme = getRandomHoverScheme();
-           return (
-             <div
-               key={book.id}
-               className={`group rounded-lg border border-border bg-background p-4 transition-all cursor-pointer relative hover:border-[${hoverScheme.text}]`}
-               style={{
-                 ['--hover-bg' as string]: hoverScheme.bg,
-                 ['--hover-text' as string]: hoverScheme.text,
-               }}
-               onClick={() => navigate(`/books/${book.id}`)}
-             >
-               <div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100">
-                 {book.is_public && (
-                   <Button
-                     variant="ghost"
-                     size="icon"
-                     className="h-8 w-8"
-                     onClick={(e) => {
-                       e.stopPropagation();
-                       const url = `${window.location.origin}/share/book/${book.share_id}`;
-                       navigator.clipboard.writeText(url);
-                     }}
-                   >
-                     <Share2 className="h-4 w-4" />
-                   </Button>
-                 )}
-                 <Button
-                   variant="ghost"
-                   size="icon"
-                   className="h-8 w-8 text-destructive hover:text-destructive/90"
-                   onClick={(e) => handleDeleteBook(e, book.id)}
-                 >
-                   <Trash2 className="h-4 w-4" />
-                 </Button>
-               </div>
+       {promptBooks.length === 0 ? (
+         <div className="text-center py-12 space-y-4">
+           <p className="text-foreground/70">You don't have any prompt books yet.</p>
+           <Button onClick={handleCreateBook}>
+             <Plus className="h-4 w-4 mr-2" />
+             Create your first prompt book
+           </Button>
+         </div>
+       ) : (
+         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
+           {promptBooks.map((book) => {
+             const hoverScheme = getRandomHoverScheme();
+             return (
+               <div
+                 key={book.id}
+                 className={`group rounded-lg border border-border bg-background p-4 transition-all cursor-pointer relative hover:border-[${hoverScheme.text}]`}
+                 style={{
+                   ['--hover-bg' as string]: hoverScheme.bg,
+                   ['--hover-text' as string]: hoverScheme.text,
+                 }}
+                 onClick={() => navigate(`/books/${book.id}`)}
+               >
+                 <div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100">
+                   {book.is_public && (
+                     <Button
+                       variant="ghost"
+                       size="icon"
+                       className="h-8 w-8"
+                       onClick={(e) => {
+                         e.stopPropagation();
+                         const url = `${window.location.origin}/share/book/${book.share_id}`;
+                         navigator.clipboard.writeText(url);
+                       }}
+                     >
+                       <Share2 className="h-4 w-4" />
+                     </Button>
+                   )}
+                   <Button
+                     variant="ghost"
+                     size="icon"
+                     className="h-8 w-8 text-destructive hover:text-destructive/90"
+                     onClick={(e) => handleDeleteBook(e, book.id)}
+                   >
+                     <Trash2 className="h-4 w-4" />
+                   </Button>
+                 </div>
  
-               <div className="flex items-center gap-2 mb-2">
-                 <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
-                 <h3 className="font-semibold text-foreground group-hover:text-[var(--hover-text)]">{book.title}</h3>
-                 {book.is_public && (
-                   <Globe className="h-4 w-4 text-foreground/60" />
-                 )}
-               </div>
+                 <div className="flex items-center gap-2 mb-2">
+                   <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
+                   <h3 className="font-semibold text-foreground group-hover:text-[var(--hover-text)]">{book.title}</h3>
+                   {book.is_public && (
+                     <Globe className="h-4 w-4 text-foreground/60" />
+                   )}
+                 </div>
  
-               {book.description && (
-                 <p className="text-sm text-foreground/70 mb-3 group-hover:text-[var(--hover-text)]">
-                   {book.description.split(/(\{\{[^}]+\}\})/).map((part, i) => {
-                     if (part.startsWith('{{') && part.endsWith('}}')) {
-                       const variable = part.slice(2, -2).trim();
-                       return <mark key={i} className="font-medium rounded px-1 bg-[var(--hover-bg)] text-[var(--hover-text)]">{variable}</mark>;
-                     }
-                     return <span key={i}>{part}</span>;
-                   })}
-                 </p>
-               )}
+                 {book.description && (
+                   <p className="text-sm text-foreground/70 mb-3 group-hover:text-[var(--hover-text)]">
+                     {book.description.split(/(\{\{[^}]+\}\})/).map((part, i) => {
+                       if (part.startsWith('{{') && part.endsWith('}}')) {
+                         const variable = part.slice(2, -2).trim();
+                         return <mark key={i} className="font-medium rounded px-1 bg-[var(--hover-bg)] text-[var(--hover-text)]">{variable}</mark>;
+                       }
+                       return <span key={i}>{part}</span>;
+                     })}
+                   </p>
+                 )}
  
-               <div className="text-xs text-foreground/60">
-                 {book.prompts?.length || 0} prompts
-               </div>
-             </div>
-           );
-         })}
-       </div>
+                 <div className="text-xs text-foreground/60">
+                   {book.prompts?.length || 0} prompts
+                 </div>
+               </div>
+             );
+           })}
+         </div>
+       )}
      </div>
    );
```

---

_****_

I've added a conditional render that shows a friendly message when there are no prompt books. The message includes:
1. A descriptive text saying "You don't have any prompt books yet"
2. A button to create their first prompt book, using the same `handleCreateBook` function that's used in the header
3. The button includes the Plus icon to maintain consistency with the design

The message is centered and has proper spacing with `py-12` for vertical padding and `space-y-4` for spacing between the text and button. When there are prompt books, it will show the existing grid layout as before.

The styling matches the existing design system using the same color tokens (`text-foreground/70` for muted text) and button components. Would you like me to make any adjustments to the message or its styling?

---



---

