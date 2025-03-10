## SpecStory

## SQL Migration File Fix (10/03/2025, 22:17:56)

_**User**_

Fix

---

_**Assistant**_

I see the issue in the SQL migration file. The error occurs because the `LANGUAGE` specification needs to be before the function body. Currently, the `SET search_path` clause is in the wrong position. Let me fix the function definition order.

I'll edit the migration file to correct the syntax:

---

_****_

```diff
  CREATE OR REPLACE FUNCTION public.update_prompt_version()
  RETURNS TRIGGER 
- SET search_path = public, '';
+ LANGUAGE plpgsql
+ SECURITY DEFINER
+ SET search_path = public, pg_temp
  AS $$
  BEGIN
    RETURN NEW;
  END;
- $$ LANGUAGE plpgsql SECURITY DEFINER;
+ $$;
```

---

_****_

I've made the following changes to fix the SQL migration:

1. Moved the `LANGUAGE plpgsql` specification before the function body
2. Placed `SECURITY DEFINER` after the language specification
3. Moved `SET search_path` clause to the correct position
4. Also improved the search path to use `pg_temp` instead of an empty string, which is a better practice for temporary objects
5. Fixed the closing syntax by removing the redundant specifications after the closing `$$`

The function should now work correctly. The error occurred because PostgreSQL expects the `LANGUAGE` specification before the function body, and the `SET search_path` clause needs to be in the proper position in the function definition.

You can try running `supabase db push` again, and it should work now. Would you like me to verify anything else about the migration?

---



---

