# SmartPG API Layer

This directory (`lib/api`) encapsulates all data operations for the SmartPG application. 
By architecture rule, **no UI component is allowed to touch `localStorage` or `fetch` directly.**

## Architecture

Currently, the application runs in a frontend-only state where data is persisted to the browser's `localStorage` via the generic `lib/storage/db.ts` adapters. 
To prepare for the eventual backend migration, we have defined a **Data Contract Freeze**.

### Key Rules
1. **Isolated Data:** Every collection (Properties, Rooms, Beds, Tenants, etc.) must include `id`, `createdAt`, `updatedAt`, and when applicable, `ownerId` and `propertyId`.
2. **Type Safety:** All models are documented in `src/lib/types/contract.ts`. Always use these types.
3. **No Direct LocalStorage in Components:** Components must call `api.collectionName.methodName()`.
4. **HTTP Switch (Future-Proofing):** We have added `http.ts` which acts as a switch between `local` and `http` modes. Once the backend is ready, flipping this switch will route calls to actual HTTP endpoints without needing to rewrite UI components.

## Sub-Modules Overview

- `auth.ts`: Authentication and session management
- `owners.ts`: Managing PG Owners
- `properties.ts`: Managing properties (PGs)
- `rooms.ts` / `beds.ts`: Inventory management
- `tenants.ts`: Tenant lifecycle
- `finance.ts`: Revenue, invoices, and expenses
- `complaints.ts`: Maintenance and issue tracking
- `mess.ts`: Food and mess wallet operations
- `ownerRequests.ts`: Public website onboarding requests

## Backend Migration Path (The `http.ts` switch)
In `lib/api/http.ts`, the `MODE` constant is currently set to `'local'`.
When migrating to a real backend:
1. Implement the `httpFetch` methods to hit your actual REST/GraphQL endpoints.
2. Change `MODE` to `'http'`.
3. The UI will instantly switch to server-driven data without any component rewrites, provided the API contracts in `contract.ts` are respected by the backend.
