# SpendShare Next.js

SpendShare is a collaborative expense tracking and split-bill app built with Next.js and Firebase.

## Architecture

- **Client-side app**: React with Next.js App Router.
- **Authentication**: Firebase Auth via Google sign-in.
- **Realtime database**: Firebase Realtime Database stores splits, members, expenses, and settlements.
- **PWA support**: `manifest.json`, service worker (`public/sw.js`), and `apple-touch-icon` support make the app installable on Android and iOS.
- **Static export / hosting**: The app is exported and hosted via Firebase Hosting using `next export` configuration.

## Project Structure

- `src/app/`
  - `layout.tsx` — root layout with metadata, PWA metadata, and service worker registration.
  - `page.tsx` — home page.
  - `profile/page.tsx` — user profile page.
  - `split/page.tsx` — split home page and split dashboard route.
- `src/components/` — shared UI and app logic components.
- `src/hooks/` — custom hooks for auth and user categories.
- `src/lib/` — utility functions and Firebase configuration.
- `public/` — static assets, PWA manifest, service worker, and app icons.

## App Flow

1. **Sign in**
   - User signs in using Google.
   - Auth state is managed via `src/hooks/useAuth.ts`.

2. **View dashboard**
   - Authenticated users see a dashboard of existing splits and quick actions.
   - Split cards list groups that the user owns or belongs to.

3. **Create / join split**
   - New splits are created in Firebase and a shareable link is generated.
   - Users can join existing splits by pasting a split link or ID.

4. **Split detail view**
   - The split dashboard loads using a client-side `id` query parameter (`/split?id={splitId}`).
   - The app fetches split data from Firebase in realtime.

5. **Manage expenses**
   - Add split expenses, update participants, and track settlement status.
   - Settlement calculations are handled in `src/lib/calculateSettlement.ts`.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Production Build

```bash
npm run build
```

This builds the app for production and generates the static output in `out/`.

## Firebase Hosting

```bash
firebase deploy --only hosting
```

The app is currently configured to deploy the exported `out/` directory.

## PWA Installation

- Android: install from the browser prompt or use "Add to Home screen".
- iOS: install from Safari using "Add to Home Screen".

The app uses a manifest, service worker, and app metadata to support standalone install.

## Branch and Repo

This branch is `SPendShare-NextJs`, pushed to `https://github.com/indrajithHM/SpendShare.git`.

## Notes

- Split detail routing is handled via query parameters, not dynamic Next.js server routes.
- The app uses a client-side service worker registration and static PWA assets.
- Cache-control headers are configured in `firebase.json` to reduce stale content issues.
