# SpendShare Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Web UI)                       │
│                      React + Vite + Bootstrap                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
        ┌───────────▼──────┐  ┌─────▼─────┐  ┌────▼────────────┐
        │  Pages/Views     │  │  Components   │  │   Services     │
        ├──────────────────┤  ├────────────┤  ├────────────────┤
        │ • Dashboard      │  │ Header     │  │ Firebase Auth  │
        │ • Profile        │  │ BottomNav  │  │ Realtime DB    │
        │ • SplitHome      │  │ SplitCard  │  │ useUserCate...│
        │ • SplitDashboard │  │ SettleName │  │ calculateSet..│
        │                  │  │ CategoryEx │  │ settlement.js  │
        │                  │  │ SummaryCard│  └────────────────┘
        └──────────────────┘  └────────────┘
                    │
                    └──────────────────┬───────────────────┘
                                       │
                            ┌──────────▼──────────┐
                            │   Features/Logic    │
                            ├─────────────────────┤
                            │ • Expense Tracking  │
                            │ • Bill Splitting    │
                            │ • Settlement Logic  │
                            │ • Expense Filtering │
                            │ • Budget Tracking   │
                            └──────────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            │                          │                          │
    ┌───────▼────────┐      ┌──────────▼────────┐      ┌─────────▼────────┐
    │  Firebase Auth │      │  Realtime DB      │      │  Firebase Hosting│
    │                │      │                   │      │                  │
    │ • Google Login │      │ • users/{uid}     │      │ • Dist folder    │
    │ • Auth State   │      │ • expenses/{id}   │      │ • SPA routing    │
    │ • User Session │      │ • splits/{id}     │      │ • 404 rewrites   │
    └────────────────┘      │ • settlements/{id}│      └──────────────────┘
                            │ • categories      │
                            └───────────────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        │                             │
                ┌───────▼──────┐          ┌──────────▼──────┐
                │   User Data  │          │  App Data Store │
                ├──────────────┤          ├─────────────────┤
                │ • Profile    │          │ • Expenses      │
                │ • Categories │          │ • Splits/Groups │
                │ • Settings   │          │ • Settlements   │
                └──────────────┘          │ • Transactions  │
                                          └─────────────────┘
```

## Component Hierarchy

```
App (Router)
├── GoogleLogin (Auth)
├── Header (Navigation)
├── Dashboard
│   ├── AddExpense
│   ├── ExpenseFilter
│   ├── CategoryExpenseList
│   ├── CategoryGrid
│   └── CategoryBudgetRing
├── SplitHome
│   ├── JoinSplitViaLinkModal
│   ├── CreateSplit
│   └── SplitCard
├── SplitDashboard
│   ├── SplitCard
│   ├── UserBalanceCard
│   ├── AddSplitExpense
│   ├── EditSplitExpenseModal
│   ├── SettlementView
│   └── SettlementHistory
├── Profile
├── BottomNav (Navigation)
└── BottomSheet (Modal UI)
```

## Data Flow

```
User Interaction
      │
      ▼
React Component (State)
      │
      ├──→ Read: Firebase Auth (user session)
      │
      ├──→ Read: Realtime DB (expenses, splits, settlements)
      │
      ├──→ Write: Realtime DB (create/update/delete)
      │
      └──→ Calculate: Local JS Logic
           • calculateSettlement()
           • settlement.js
           • categoryIcons.js
           • useUserCategories hook
```

## Key Features & Modules

| Feature | Components | Data Store | Utilities |
|---------|-----------|-----------|-----------|
| **Expense Tracking** | AddExpense, CategoryExpenseList, ExpenseFilter | DB: expenses/{uid} | categories.js, categoryIcons.js |
| **Bill Splitting** | SplitHome, SplitDashboard, CreateSplit, AddSplitExpense | DB: splits/{splitId} | calculateSettlement.js |
| **Settlement** | SettlementView, SettlementHistory | DB: settlements/{id} | settlement.js |
| **User Profile** | Profile, Header | DB: users/{uid} | GoogleLogin |
| **Category Budget** | CategoryBudgetRing | Local: useUserCategories | categoryIcons.js |

## Tech Stack

```
Frontend:
├── React 19.2.0 (UI Framework)
├── React Router 7.11.0 (Routing)
├── Vite 7.2.4 (Build Tool)
├── Bootstrap 5.3.8 (UI Components)
├── Bootstrap Icons 1.13.1 (Icons)
└── Recharts 3.6.0 (Data Visualization)

Backend/Services:
├── Firebase Authentication (Google OAuth)
├── Firebase Realtime Database
└── Firebase Hosting (Deployment)

Dev Tools:
├── ESLint 9.39.1 (Code Quality)
├── Vite Plugin React 5.1.1 (HMR)
└── Vite Plugin PWA 1.2.0 (Progressive Web App)
```

## Authentication Flow

```
User Visits App
        │
        ▼
onAuthStateChanged Listener
        │
        ├─→ NOT LOGGED IN → GoogleLogin Component
        │                          │
        │                          ▼
        │                   Google Auth Popup
        │                          │
        │                          ▼
        │                   ensureUserProfile()
        │
        └─→ LOGGED IN → Create user profile in DB
                               │
                               ▼
                        Render Main App (Dashboard)
```

## Database Schema (Firebase Realtime)

```
{
  "users": {
    "{userId}": {
      "createdAt": timestamp
    }
  },
  "expenses": {
    "{userId}": {
      "{expenseId}": {
        "category": string,
        "amount": number,
        "date": string,
        "description": string,
        "createdAt": timestamp
      }
    }
  },
  "splits": {
    "{splitId}": {
      "name": string,
      "members": [userId],
      "createdBy": userId,
      "createdAt": timestamp,
      "expenses": [{expenseId}],
      "settlements": [{settlementId}]
    }
  },
  "settlements": {
    "{settlementId}": {
      "from": userId,
      "to": userId,
      "amount": number,
      "splitId": string,
      "status": "pending|completed",
      "createdAt": timestamp
    }
  }
}
```

## Deployment Pipeline

```
Code (GitHub)
    │
    ▼
npm run build
    │
    ▼
Vite Build (dist/)
    │
    ├─ Bundles React App
    ├─ Tree-shaking
    └─ Minification
    │
    ▼
Firebase Deploy (firebase.json config)
    │
    ├─ Upload dist/ to Firebase Hosting
    ├─ SPA Routing: All routes → index.html
    └─ Public URL: spendshare-app.web.app
```

## Key Services & Utilities

### Authentication Service
- **File**: `firebase.js`
- **Exports**: `auth`, `db` (Firebase instances)
- **Usage**: Initialize Firebase app, provide auth and DB access

### Settlement Calculation
- **File**: `calculateSettlement.js`
- **Purpose**: Calculate how much each person owes/is owed in a split
- **Returns**: Settlement array with from/to/amount

### User Categories Hook
- **File**: `useUserCategories.js`
- **Purpose**: Manage user's expense categories
- **Returns**: Categories state and helper functions

### Expense Categories
- **File**: `categories.js`
- **File**: `categoryIcons.js`
- **Purpose**: Define expense categories and their icon mappings
