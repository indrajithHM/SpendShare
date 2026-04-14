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
  - `AddExpense.tsx` — expense addition with manual entry and QR scanning tabs.
  - `ScanAndPay.tsx` — QR scanning and UPI payment flow.
  - `QRScanner.tsx` — camera-based QR code scanner component.
- `src/hooks/` — custom hooks for auth and user categories.
- `src/lib/` — utility functions and Firebase configuration.
  - `upiUtils.ts` — UPI QR parsing and payment link generation.
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
   - **QR Payment Feature**: Scan UPI QR codes for instant payments and automatic expense tracking.
     - Scan merchant QR codes using device camera.
     - Extract payment details (amount, merchant, UPI ID).
     - Select expense category before payment.
     - Choose from available UPI apps (Google Pay, Paytm, PhonePe, etc.).
     - Complete payment and automatically add transaction to expenses.

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

## QR Payment Feature

The app includes a QR code scanning feature for UPI payments:

- **Camera Access**: Requests camera permissions for QR scanning.
- **UPI Integration**: Supports major UPI apps (Google Pay, Paytm, PhonePe, BHIM UPI, Amazon Pay, WhatsApp Pay).
- **Automatic Expense Tracking**: Scanned payments are automatically categorized and added to expense records.
- **Cross-Platform**: Works on both Android and iOS PWA installations.

To use:
1. Open the "Scan & Pay" tab in Add Expense.
2. Allow camera access when prompted.
3. Scan a UPI QR code from any merchant.
4. Select an expense category.
5. Choose your preferred UPI app.
6. Complete payment and add to expenses.

## Branch and Repo

This branch is `SPendShare-NextJs`, pushed to `https://github.com/indrajithHM/SpendShare.git`.

## Notes

- Split detail routing is handled via query parameters, not dynamic Next.js server routes.
- The app uses a client-side service worker registration and static PWA assets.
- Cache-control headers are configured in `firebase.json` to reduce stale content issues.
