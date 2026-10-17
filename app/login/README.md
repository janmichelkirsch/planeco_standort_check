# app/login/

Login für das Sales-Team (`/login`).

- `page.tsx` – Seite mit dem Login-Formular (`components/LoginForm.tsx`).
- `actions.ts` – Server Action `login`: meldet per Supabase Auth (E-Mail + Passwort) an und leitet zu `/admin` weiter.
  Fehlermeldung bewusst unspezifisch („E-Mail oder Passwort falsch“).
