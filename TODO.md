# Food Guard - Master To-Do & Project Status List

This document tracks all missing features, inactive components, mock services, and UI/UX improvements needed to bring the application to production readiness.

> [!NOTE]
> **📌 Aktif Tasarım İyileştirme ve Değerlendirme Süreci (Mayıs 2026):**
> Kullanıcı arayüzünü (UI/UX) premium hale getirmek için başlatılan modernizasyon çalışması şu anda **`feature/ui-ux-premium-redesign`** git dalında (branch) aktiftir. 
> - Orijinal kod tabanı `main` dalında tamamen güvendedir.
> - Dilediğiniz an dallar arasında geçiş yaparak eski ve yeni tasarımı karşılaştırabilirsiniz.
> - Tasarım tamamen içinize sindiğinde değişiklikler ana kod tabanına (main) aktarılacaktır.


## 1. 🔄 Features to Activate (Mock → Real)
These features are currently simulated (MOCK) and need to be connected to real third-party services or activated.

- [x] **Email Verification:** 
  - *Frontend:* UI is active in `settings/page.tsx`.
  - *Backend:* Replaced `mock-email.adapter.ts` with `nodemailer.adapter.ts` (Gmail SMTP). Sends branded HTML verification code emails.
  - *Setup needed:* Add `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` to `.env`.
- [x] **SMS / Phone Verification:**
  - *Frontend:* Firebase JS SDK integrated (`signInWithPhoneNumber` + invisible reCAPTCHA). Settings page has always-visible Phone Verification panel.
  - *Backend:* Firebase Admin SDK initialized in `main.ts`. `verifyPhone` uses `admin.auth().verifyIdToken()` to validate Firebase ID tokens.
  - *Bonus:* Phone number change triggers automatic re-verification (backend resets `isPhoneVerified`). Account becomes `VERIFIED` when both email + phone are confirmed.
- [x] **AI Safety Analysis (Gemini):**
  - *Backend:* Currently uses `mock-ai.adapter.ts` for evaluating food listings. 
  - *Action:* The Gemini API key is in `.env` (commented out). Needs to be activated and switched to `gemini.adapter.ts`.
- [x] **Real-Time Chat & WebSockets:**
  - *Frontend:* Remove `localStorage` fallback in `chatService.ts` for chat history and conversation lists.
  - *Backend:* Create a `Conversation` database table (Entity) to group messages. Write a `GET /conversations` endpoint so the frontend can list active chats without relying on browser memory.

## 2. ⚙️ Backend Development (TODOs)
- [ ] **Repositories:** Complete missing complex queries, pagination, and relation loading in:
  - `user.repository.ts`
  - `product.repository.ts`
  - `request.repository.ts`
  - `review.repository.ts`
  - `notification.repository.ts`
- [ ] **Product Creation Flow:** Resolve TODO in `create-product.use-case.ts` (likely integrating the AI Safety analysis pipeline automatically when a new listing is created).
- [ ] **Entities:** Resolve TODO in `risk-report.entity.ts` (ensure proper database relations with the Product entity).

## 3. 🖥️ Frontend Integration
- [ ] **API Services:** Fully connect `requestService.ts` and `productService.ts` to the NestJS backend and remove any fallback mock data.
- [ ] **Dashboard & Donation Cards:** Replace mock calculations (e.g., unread chat counts, incoming requests) with real live data from context/WebSocket.
- [ ] **Product Categories:** Review and reorganize product listing categories (e.g., add/rename/remove category options on the listing creation form and filter panel).

## 4. 🎨 UI/UX & Professional Design Improvements
*To-do items to elevate the platform from a "basic/AI-generated" look to a premium, professional application:*

- [x] **Iconography:** Replace all generic system emojis (⚙️, 👤, 📦) with a professional SVG icon library (e.g., Lucide Icons, Heroicons).
- [x] **Typography:** Integrate a modern, clean web font (e.g., Inter, Outfit, or Plus Jakarta Sans) with proper hierarchy and font weights.
- [x] **Color Palette & Depth:** Move away from basic flat colors. Implement a cohesive, rich color system. Use subtle shadows (elevation) and soft gradients or glassmorphism.
- [x] **Micro-animations & Interactions:** Add smooth CSS transitions on hover, active states, and page navigation. Use *Skeleton Loading* instead of basic spinners for data fetching.
- [x] **Dark Mode Toggle:** Implement a premium, smooth, accessible Dark Mode theme toggle with local storage persistence and system preference synchronization.
- [ ] **Spacing & Layout Consistency:** Ensure uniform padding/margins across all components. Let elements "breathe".
- [ ] **High-Quality Assets:** Use professional, consistent placeholder images for empty states or default avatars.
- [x] **Localization:** Translate all remaining UI text, badges, headers, and alerts from Turkish to English to ensure the entire application is fully English-localized.
