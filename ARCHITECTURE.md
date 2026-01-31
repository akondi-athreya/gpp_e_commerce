# E-Commerce Application - Architecture & Design Decisions

## 1. Project Architecture & API Route Structure

**Q: Describe your project's architecture, particularly how you structured your API routes and managed server-side logic.**

The project uses a modular **Pages Router** architecture with clear separation: `pages/` contains all UI routes, `pages/api/` contains backend endpoints, and `lib/` holds utilities. API routes are organized as `pages/api/auth/[...nextauth].js` for OAuth and `pages/api/cart/index.js` for cart operations, with each route handling a single responsibility (authentication vs. cart management).

---

## 2. Folder Structure & Database Connection Patterns

**Q: Explain the folder structure for your API routes, how you handled database connections, and any patterns you used to separate concerns.**

Database connections are centralized in `lib/prisma.js` using a singleton pattern (prevents multiple PrismaClient instances in development), while API routes import this shared instance. The folder structure mirrors HTTP concepts: `/api/auth/*` for authentication endpoints, `/api/cart/*` for shopping functionality, and `pages/*` for pages, making concerns naturally separated by feature rather than layer type.

---

## 3. Why Server-Side Rendering (SSR) Over SSG or CSR

**Q: Explain your decision-making process for using Server-Side Rendering. What are the trade-offs compared to SSG or CSR in this e-commerce context?**

SSR was chosen because e-commerce product data changes frequently (inventory, prices) and needs real-time freshness; SSG would require rebuilding for every product change (impractical), while pure CSR would harm SEO and show loading spinners to users. The trade-off is slightly higher server load vs. always-fresh data and better SEO—critical for product discoverability.

---

## 4. Data Freshness, SEO, Performance & Development Complexity

**Q: Discuss factors like data freshness, SEO, performance, and development complexity.**

**Data Freshness:** Each page request hits the database, guaranteeing latest product/pricing info. **SEO:** Server-rendered HTML includes product meta (title, price) for search engines and social shares. **Performance:** Slightly slower initial requests but eliminates "blank screen" loading time for users with slow JS. **Complexity:** More server load requires efficient database queries, which we managed via Prisma's optimized queries.

---

## 5. User Session Management & Route Protection

**Q: How did you manage user sessions and protect routes? Describe the authentication flow from login to accessing '/cart'.**

Authentication flow: (1) User clicks "Sign In" → redirected to NextAuth's GitHub signin page, (2) After OAuth callback, NextAuth creates Session + User records in database, (3) `middleware.js` intercepts `/cart` requests, checks for valid session token, (4) Unauthenticated users get 307 redirect to signin, (5) Authenticated users reach the cart page. Session is stored in database via PrismaAdapter and validated on every protected request.

---

## 6. NextAuth.js, Middleware, Cookies & useSession Hook

**Q: Detail the roles of NextAuth.js, middleware, session cookies, and the `useSession` hook.**

**NextAuth.js:** Manages OAuth flow and creates session records. **Middleware:** Acts as a gatekeeper—checks for session token in requests to `/cart` and redirects if missing. **Cookies:** NextAuth stores encrypted session token in cookies automatically (browser sends it with every request). **useSession Hook:** Used in components to retrieve current user session and display appropriate buttons (signin vs signout).

---

## 7. Client-Side State Management for Shopping Cart

**Q: Discuss your approach to client-side state management for the shopping cart. Why did you choose your particular method?**

We use **React's built-in useState hook** instead of Context or Redux because cart data is simple (list of items with quantity) and only needed on one page (`/cart`). This avoids over-engineering—no global state needed since the cart syncs with the backend API on each operation, and the user must be logged in to access `/cart` anyway.

---

## 8. Client-Side to Backend Sync Pattern

**Q: Explain how the client-side state syncs with the backend via your API routes and the benefits of your chosen approach.**

When user adds/removes items, the client sends POST/DELETE requests to `/api/cart`, which updates the database and returns the new cart state. We then update React state with the response, keeping client and backend in sync. This approach is reliable because: (1) Database is source of truth, (2) No race conditions from multiple tabs (each request validates user session), (3) Simple to understand and debug vs. complex caching strategies.

---

## 9. Testing Strategies Beyond data-testid

**Q: What further testing strategies would you implement to ensure reliability in production?**

**Unit Tests:** Jest tests for API logic (e.g., cart adding validates productId is a string). **Integration Tests:** Test full flow—create user → add product → verify cart count increased. **E2E Tests:** Playwright/Cypress simulates real browser: login → add item → checkout → verify database saved correctly. **Load Tests:** k6 script simulates 100 concurrent users adding to cart, ensuring database handles traffic.

---

## 10. Unit Tests for API Routes

**Q: Consider unit tests for API route logic.**

Example test for `POST /api/cart`: Mock session, mock Prisma, send {productId: "valid-id", quantity: 2}, assert response is 200 and cart.items.length === 1. Test negative case: send {productId: 123} (wrong type), assert 400 Bad Request with "productId must be string" error—this validates Zod schema catches invalid inputs.

---

## 11. Integration Tests for Page Components

**Q: Consider integration tests for page components.**

Test `pages/index.js`: Seed database with 3 products, make getServerSideProps call, assert returned props contain all 3 products. Test search: call with query={q: "shoe"}, assert only shoe product returned. Test pagination: call with {page: 2}, assert correct offset/limit used in Prisma query, verifying server-side search and pagination work end-to-end.

---

## 12. Comprehensive End-to-End Test Scenarios

**Q: Consider more comprehensive end-to-end test scenarios.**

**Scenario 1:** New user lands on homepage → sees 6 products → searches for "jacket" → sees 1 result → clicks product → views details → adds to cart → redirected to signin → logs in → sees item in cart. **Scenario 2:** Logged-in user modifies quantity → removes item → cart updates without page refresh → verifies database shows updated state. These test real user workflows, not just isolated features.

---

## Summary: Architectural Strengths

✅ **Separation of Concerns:** API routes isolated from pages; database access centralized in `lib/prisma.js`  
✅ **Security:** NextAuth handles OAuth securely; middleware protects sensitive routes; sessions stored server-side  
✅ **Data Integrity:** SSR ensures fresh data; database is single source of truth  
✅ **Scalability:** Singleton pattern prevents connection pool issues; Prisma queries optimized for performance  
✅ **Testability:** data-testid attributes enable E2E testing; clear API contracts make unit testing straightforward  

---

## Trade-offs Made

⚖️ **SSR vs CSR:** Chose SSR for freshness/SEO, accepting slightly higher server load  
⚖️ **Simple State vs Complex State:** Chose useState over Redux, accepting reinvocation of API calls (but simplicity wins for small cart)  
⚖️ **Database Sessions vs JWT:** Chose database sessions (PrismaAdapter) for flexibility, accepting slight DB overhead on every request  
⚖️ **GitHub OAuth Only:** Implemented single provider to reduce complexity; could add Google/Discord later without major refactoring  
