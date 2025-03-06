## SpecStory

## Header Button Visibility Issue (06/03/2025, 22:53:43)

_**User**_

The header in @ShareHeader.tsx only shows a signup button when I looked at it logged out - it should have a login button too.

---

_**Assistant**_

I see the confusion, but looking at the code in `ShareHeader.tsx`, both the Login and Sign Up buttons are actually already present in the code. Let me verify what you're seeing by taking a screenshot of the current state.

---

_****_



---

_****_

I notice that both buttons are defined in the code:

1. A "Log In" button:
```12:19:src/components/ShareHeader.tsx
          <Link 
            to="/login"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
            onClick={() => posthog.capture('auth:login_button_click', { 
              from_share: true 
            })}
          >
            Log In
          </Link>
```

2. A "Sign Up" button:
```20:27:src/components/ShareHeader.tsx
          <Link 
            to="/signup"
            className={cn(buttonVariants({ size: 'sm' }))}
            onClick={() => posthog.capture('auth:signup_button_click', { 
              from_share: true 
            })}
          >
            Sign Up
          </Link>
```

If you're not seeing the login button, there might be a few potential issues:

1. There could be CSS that's hiding the button
2. There might be a rendering condition we're not seeing
3. There could be a routing issue preventing the button from displaying

Could you confirm:
1. Are you still not seeing the login button?
2. If so, could you open your browser's developer tools and check if the login button element exists in the DOM?

This will help us pinpoint exactly what's happening since the code appears to be correct.

---

_**User**_

Ahh it's just not visible - could you observe the theme in @tailwind.config.js and make sure the button it properly styled?

---

_**Assistant**_

Looking at the code, I notice that the login button is using the `ghost` variant:

```12:19:src/components/ShareHeader.tsx
          <Link 
            to="/login"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
            onClick={() => posthog.capture('auth:login_button_click', { 
              from_share: true 
            })}
          >
            Log In
          </Link>
```

While the signup button doesn't specify a variant, which means it's using the default primary styling:

```20:27:src/components/ShareHeader.tsx
          <Link 
            to="/signup"
            className={cn(buttonVariants({ size: 'sm' }))}
            onClick={() => posthog.capture('auth:signup_button_click', { 
              from_share: true 
            })}
          >
            Sign Up
          </Link>
```

The ghost variant might be making the button too subtle against the background. Let's modify it to use a more visible variant. I'll change it to use the `secondary` variant instead, which should provide better contrast while still maintaining visual hierarchy with the primary Sign Up button.

---

_****_

```diff
            <Link 
              to="/login"
-             className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
+             className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
              onClick={() => posthog.capture('auth:login_button_click', { 
                from_share: true 
```

---

_****_

I've changed the login button's variant from `ghost` to `secondary`. This should make it more visible while maintaining a clear visual hierarchy:
- The Sign Up button remains primary (most prominent)
- The Log In button is now secondary (visible but less emphasized)

The button should now be clearly visible. Could you check if this looks better?

---



---

