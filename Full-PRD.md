# Adjourn - Product Requirements Document
*"Take a break"*

## 1. Product Overview

### Vision
A minimalist, typewriter-inspired sanctuary where thoughtful souls can unload their minds, revisit memories through words and images, and explore ideas with an AI companion—all wrapped in the cozy, nostalgic atmosphere of a personal writing retreat.

### Target Users
- **Primary**: Your girlfriend - someone who values thoughtful reflection and memory-keeping
- **Secondary**: Anyone seeking a distraction-free, aesthetic journaling experience with modern conveniences

### Core Value Propositions
1. **Effortless Daily Journaling**: From open to typing in under 5 seconds (mobile or desktop)
2. **Visual Memory Keeping**: Polaroid-style photo memories attached to each day
3. **Forgiving Habit Building**: Restore streaks by filling in missed days
4. **AI Writing Companion**: Non-intrusive creative and linguistic assistance
5. **Timeless Aesthetic**: Typewriter nostalgia meets modern minimalism
6. **Mobile-First Experience**: Seamless journaling on-the-go with native-feeling interactions

## 2. Design System

### Visual Identity - Mobile-First Approach
```css
/* Mobile-First Color Palette */
--background: #FAFAF8;      /* Off-white */
--text-primary: #2A2A2A;    /* Charcoal */
--accent: #5D6D4E;          /* Muted olive */
--secondary: #8B8680;       /* Warm gray */
--success: #7FA66D;         /* Soft green */
--polaroid-shadow: rgba(0,0,0,0.1);

/* Responsive Typography */
--font-primary: 'IBM Plex Mono', 'Courier Prime', monospace;
--font-size-base-mobile: 15px;
--font-size-base-desktop: 16px;
--line-height-mobile: 1.7;
--line-height-desktop: 1.6;

/* Mobile-First Layout */
--content-width-mobile: 100%;
--content-width-tablet: 680px;
--content-width-desktop: 680px;
--content-padding-mobile: 16px;
--content-padding-desktop: 24px;

/* Touch-Friendly Spacing */
--touch-target-min: 44px;
--spacing-unit: 8px;
--safe-area-inset: env(safe-area-inset-bottom);
```

### Mobile UI Components
- **Touch targets**: Minimum 44x44px for all interactive elements
- **Buttons**: Full-width on mobile with 48px height
- **Bottom sheet modals**: For mobile actions (instead of dropdowns)
- **Swipe gestures**: Navigate between journals and dates
- **Pull-to-refresh**: Sync latest changes
- **Haptic feedback**: Subtle vibrations for key actions (iOS)

## 3. Technical Architecture

### Tech Stack - Enhanced for Mobile
```yaml
Frontend:
  - Framework: Next.js 14 (App Router) with PWA support
  - Styling: Tailwind CSS with mobile-first utilities
  - State Management: Zustand with persistence
  - Data Fetching: React Query with offline support
  - Image Handling: react-dropzone + browser-image-compression (lossless WebP)
  - Date Handling: date-fns
  - Markdown: react-markdown
  - PWA: next-pwa for installable app experience
  - Mobile Gestures: react-swipeable
  - Virtual Keyboard: react-viewport-height
  
Backend:
  - Database: Supabase (PostgreSQL)
  - Authentication: Supabase Auth (Magic Links)
  - Storage: Supabase Storage (for images)
  - Edge Functions: Supabase Edge Functions (Deno)
  - AI: Google Gemini 2.5 Flash

Deployment:
  - Frontend: Vercel with Edge Network
  - Backend: Supabase Cloud
  
Development:
  - Language: TypeScript
  - Linting: ESLint + Prettier
  - Git Hooks: Husky + lint-staged
  - Mobile Testing: BrowserStack
```

### Progressive Web App Configuration
```javascript
// next.config.js PWA settings
{
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.adjourn\.app\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 // 24 hours
          }
        }
      }
    ]
  }
}
```

### Database Schema (with mobile optimizations)
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Journals table
CREATE TABLE journals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT to_char(CURRENT_DATE, 'Month DD, YYYY'),
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW() -- For mobile quick access
);

-- Create slug trigger
CREATE OR REPLACE FUNCTION generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug = lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(NEW.id::text, 1, 8);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journals_slug_trigger
BEFORE INSERT ON journals
FOR EACH ROW
EXECUTE FUNCTION generate_slug();

-- Entries table
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_id UUID REFERENCES journals(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  mood TEXT,
  writing_duration INTEGER DEFAULT 0, -- seconds spent writing
  device_type TEXT DEFAULT 'unknown', -- 'mobile', 'tablet', 'desktop'
  UNIQUE(journal_id, entry_date)
);

-- Images table (Polaroids) - with WebP optimization
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  webp_url TEXT, -- Lossless WebP version
  original_url TEXT, -- Original upload
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  file_size INTEGER, -- bytes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Streaks table
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_entry_date DATE,
  total_entries INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  restored_dates DATE[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Conversations table
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES entries(id) ON DELETE SET NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Messages table
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompts table (for daily prompts)
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_text TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  season TEXT, -- 'winter', 'spring', 'summer', 'fall'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences table - with mobile-specific settings
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'sepia')),
  font_family TEXT DEFAULT 'IBM Plex Mono',
  font_size INTEGER DEFAULT 16,
  font_size_mobile INTEGER DEFAULT 15,
  sound_enabled BOOLEAN DEFAULT FALSE,
  haptic_enabled BOOLEAN DEFAULT TRUE, -- Mobile vibration feedback
  daily_prompts_enabled BOOLEAN DEFAULT TRUE,
  default_journal_id UUID REFERENCES journals(id) ON DELETE SET NULL,
  autosave_interval INTEGER DEFAULT 5, -- seconds
  swipe_navigation BOOLEAN DEFAULT TRUE, -- Mobile swipe gestures
  mobile_keyboard_toolbar BOOLEAN DEFAULT TRUE, -- Show formatting toolbar above keyboard
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offline queue table for mobile sync
CREATE TABLE offline_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'create_entry', 'update_entry', etc.
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ,
  error_count INTEGER DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX entries_journal_date_idx ON entries(journal_id, entry_date);
CREATE INDEX entries_user_date_idx ON entries(journal_id, entry_date DESC);
CREATE INDEX images_entry_order_idx ON images(entry_id, display_order);
CREATE INDEX ai_messages_conversation_idx ON ai_messages(conversation_id, created_at);
CREATE INDEX journals_last_accessed_idx ON journals(user_id, last_accessed_at DESC);
CREATE INDEX offline_queue_user_idx ON offline_queue(user_id, synced_at NULLS FIRST);
```

### API Endpoints (with mobile optimizations)
```typescript
// Authentication
POST   /api/auth/magic-link        // Send magic link email
POST   /api/auth/verify            // Verify magic link token
POST   /api/auth/logout            // Clear session
POST   /api/auth/refresh           // Refresh token for mobile

// Journals
GET    /api/journals               // List user's journals
POST   /api/journals               // Create new journal
PATCH  /api/journals/:id           // Update journal
DELETE /api/journals/:id           // Archive journal
GET    /api/journals/recent        // Mobile: Get 5 most recent journals

// Entries
GET    /api/entries?journal_id=&date=    // Get entry by journal and date
GET    /api/entries?month=2024-12        // Get entries for calendar
POST   /api/entries                       // Create entry
PATCH  /api/entries/:id                   // Update entry (auto-save)
DELETE /api/entries/:id                   // Delete entry
POST   /api/entries/batch-sync            // Mobile: Sync offline changes

// Images
POST   /api/images/upload          // Upload image to Supabase Storage
POST   /api/images                 // Create image record
PATCH  /api/images/reorder         // Update display order
DELETE /api/images/:id             // Delete image
POST   /api/images/compress        // Convert to lossless WebP

// Streaks
GET    /api/streaks                // Get user's streak data
POST   /api/streaks/check          // Check if streak should update
POST   /api/streaks/restore        // Restore streak for a date

// AI
POST   /api/ai/chat                // Send message to Gemini
GET    /api/ai/conversations       // List conversations
GET    /api/ai/conversations/:id   // Get conversation history
POST   /api/ai/suggest             // Quick AI suggestions (mobile)

// User
GET    /api/user/preferences       // Get preferences
PATCH  /api/user/preferences       // Update preferences
GET    /api/user/export            // Export all data
DELETE /api/user                   // Delete account

// Mobile-specific
GET    /api/mobile/sync-status     // Check sync queue
POST   /api/mobile/device-info     // Register device for push
GET    /api/mobile/quick-stats     // Widget data (streak, words today)

// Misc
GET    /api/prompts/daily          // Get daily writing prompt
GET    /api/search?q=              // Search entries
```

## 4. Feature Specifications - Mobile-First Design

### 4.1 Authentication - Optimized for Mobile
- **Magic Link Flow**:
  1. User enters email on mobile-optimized form
  2. Auto-focus on email input with proper keyboard type
  3. Receives 6-digit code (SMS option for mobile users)
  4. Large number pad for code entry
  5. Auto-submit on 6th digit
  6. Biometric login option after first auth (Face ID/Touch ID)
- **Session Management**: 
  - 90-day sessions on mobile (vs 30-day desktop)
  - Biometric re-authentication for sensitive actions

### 4.2 Writing Experience - Mobile Excellence

#### Mobile Editor
- **Auto-focus**: Cursor automatically placed when opening entry
- **Viewport management**: Adjusts for keyboard height
- **Auto-save indicator**: Minimal top banner instead of toast
- **Formatting toolbar**: 
  - Appears above keyboard
  - Large touch targets (44px minimum)
  - Common actions: Bold, Italic, List, AI
- **Smart keyboard**:
  - Disable autocorrect in journal area
  - Custom keyboard shortcuts
  - Swipe down to dismiss
- **Word count**: Collapsible badge in top corner

#### Mobile-Specific Features
- **Voice-to-text**: Native speech recognition button
- **Quick actions**: Long-press for context menu
- **Gesture navigation**:
  - Swipe left/right: Previous/next day
  - Swipe down: Dismiss keyboard
  - Pinch: Adjust font size
- **Reading mode**: Double-tap to enter distraction-free reading

### 4.3 Polaroid Memories - Touch-Optimized

#### Mobile Upload Flow
```typescript
// Mobile-first upload experience
1. Large "Add Photo" button at entry top
2. Options: Camera / Photo Library / Files
3. Multi-select with checkbox overlay
4. Automatic lossless WebP conversion
5. Upload progress with cancel option
6. Drag handle appears after upload
7. Haptic feedback on reorder
```

#### Mobile Specifications
- **Camera integration**: Direct camera access
- **Batch upload**: Select up to 5 at once
- **Compression**: Lossless WebP, max 1200px wide for mobile
- **Display**:
  - Single column swipeable carousel
  - Pinch to zoom
  - Swipe up for caption editor
  - Double-tap to favorite
- **Performance**: Lazy loading with blur-up effect

### 4.4 Streak System - Mobile Motivation

#### Mobile Streak Widget
- **Home screen widget** (iOS/Android):
  - Current streak number
  - Words written today
  - Quick entry button
- **Notification**: Gentle evening reminder if not written
- **Visual feedback**: Confetti uses device haptics

#### Mobile Streak Restoration
```typescript
// Mobile-optimized restoration UI
interface MobileStreakRestore {
  // Full-screen takeover with large text
  showFullScreen: true;
  
  // Visual progress ring instead of bar
  progressRing: {
    radius: 100,
    strokeWidth: 12,
    animated: true
  };
  
  // Large, encouraging text
  message: "Just 12 more words!";
  
  // Haptic pulse every 10 words
  hapticMilestones: [10, 20, 30, ...];
}
```

### 4.5 Calendar View - Touch-First

#### Mobile Calendar Layout
- **View modes**: 
  - Month view (default)
  - Week view (landscape)
  - List view (chronological)
- **Touch interactions**:
  - Tap: Navigate to date
  - Long press: Preview entry
  - Swipe: Change month
  - Pinch: Switch view mode
- **Visual indicators**:
  - Large dots for easy tapping
  - Color coding visible at a glance
  - Today pulsates gently

### 4.6 AI Assistant (Muse) - Mobile Conversations

#### Mobile AI Interface
- **Activation**: 
  - Floating action button (FAB)
  - Voice activation: "Hey Muse"
  - Shake gesture (optional)
- **Chat UI**:
  - Full-screen modal with smooth slide-up
  - Messages in chat bubbles
  - Quick suggestion chips
  - Voice input option
- **Smart suggestions**: Based on current writing context
- **Offline queue**: AI requests saved for when online

### 4.7 Mobile Navigation

#### Bottom Tab Bar
```typescript
interface MobileNavigation {
  tabs: [
    { icon: 'edit', label: 'Today', action: 'current-entry' },
    { icon: 'calendar', label: 'Calendar', action: 'calendar-view' },
    { icon: 'book', label: 'Journals', action: 'journal-list' },
    { icon: 'sparkle', label: 'Muse', action: 'ai-chat' },
    { icon: 'user', label: 'Me', action: 'settings' }
  ];
  
  // Hides when keyboard is visible
  autoHide: true;
  
  // Badge for streak on 'Me' tab
  badges: {
    me: { type: 'streak', value: currentStreak }
  };
}
```

### 4.8 Mobile Search

#### Search Experience
- **Activation**: Pull down on journal list
- **UI**: Full-screen overlay with large input
- **Results**: Grouped by date with context
- **Filters**: Easy-access chips for date/journal/images
- **Performance**: Debounced with loading skeleton

### 4.9 Mobile Settings

#### Mobile-Optimized Preferences
```typescript
interface MobileSettings {
  sections: [
    {
      title: 'Quick Settings',
      items: [
        'Font Size Slider', // Visual slider with preview
        'Theme Switcher',   // Large visual cards
        'Haptic Toggle',    // With test vibration
      ]
    },
    {
      title: 'Notifications',
      items: [
        'Daily Reminder',   // Time picker
        'Streak Alerts',    // Toggle
        'Weekly Summary',   // Toggle
      ]
    },
    {
      title: 'Sync & Storage',
      items: [
        'Offline Storage',  // Size indicator
        'Auto-sync WiFi',   // Toggle
        'Clear Cache',      // With size shown
      ]
    }
  ]
}
```

## 5. User Flows - Mobile Journey

### 5.1 Mobile First-Time User
```mermaid
App Store → Install → Open App → 
Beautiful Intro Slides → Email Entry (auto-keyboard) → 
Check Email on Phone → Tap Magic Link → 
App Opens → Enable Notifications? → 
First Entry with Tutorial → Take First Photo → 
Success Celebration
```

### 5.2 Mobile Daily Writing
```mermaid
Notification/Widget Tap → Face ID → 
Today's Entry Opens → Keyboard Appears → 
Write (with auto-save indicator) → 
Add Photo from Today → Swipe to Yesterday → 
Check Streak Progress → Close App
```

### 5.3 Mobile Streak Restoration
```mermaid
Open App → See Broken Streak Alert → 
Tap "Restore" → Full-Screen Progress → 
Type with Haptic Feedback → 
Hit 100 Words → Celebration Animation → 
Share Achievement Option
```

### 5.4 Mobile Offline Flow
```mermaid
Open App (No Connection) → Offline Banner → 
Continue Writing → Local Save → 
Photos Queue for Upload → Connection Restored → 
Auto-sync with Progress → Success Toast
```

## 6. Performance Requirements - Mobile-First Metrics

### Mobile Speed Targets
| Action | 3G Target | 4G Target | WiFi Target |
|--------|-----------|-----------|-------------|
| App open (cached) | <2s | <1s | <0.5s |
| First meaningful paint | <3s | <1.5s | <1s |
| Time to interactive | <4s | <2s | <1.5s |
| Image upload (per photo) | <5s | <2s | <1s |
| Entry auto-save | <500ms | <200ms | <100ms |
| Offline-to-online sync | <10s | <5s | <3s |

### Mobile-Specific Requirements
- **Bundle size**: <2MB initial download
- **Offline storage**: 50MB minimum available
- **Battery usage**: <5% drain per hour of active use
- **Memory**: Works smoothly on 2GB RAM devices
- **Network**: Optimistic updates with rollback

## 7. Mobile Image Handling

### Lossless WebP Compression
```typescript
interface ImageCompression {
  format: 'webp';
  quality: 100; // Lossless
  
  // Mobile-specific sizes
  sizes: {
    thumbnail: { width: 200, height: 200 },
    mobile: { width: 800, height: 'auto' },
    tablet: { width: 1200, height: 'auto' },
    desktop: { width: 1600, height: 'auto' }
  };
  
  // Fallback for older devices
  fallbackFormat: 'jpeg';
  
  // Progressive loading
  progressive: true;
  
  // EXIF data preservation
  preserveMetadata: ['date', 'location'];
}
```

## 8. Progressive Web App Features

### PWA Capabilities
- **Install prompts**: Smart timing after 3 sessions
- **App icon**: Adaptive icon for Android, Apple touch icon
- **Splash screen**: Matching brand colors
- **Orientation**: Portrait preferred, landscape supported
- **Status bar**: Matching theme color
- **Share target**: Receive shared text/images
- **Shortcuts**: Quick actions from app icon

### Service Worker Strategy
```javascript
// Offline-first with smart caching
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/entries')) {
    // Cache-first for entries
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  } else if (event.request.url.includes('/images')) {
    // Network-first for images with cache fallback
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  }
});
```

## 9. Development Phases - Mobile Priority

### Phase 1: Mobile Foundation (Week 1-2)
- [ ] Mobile-first responsive design
- [ ] PWA setup with install capability
- [ ] Touch-optimized authentication
- [ ] Mobile editor with keyboard handling
- [ ] Basic offline support

### Phase 2: Core Mobile Features (Week 3-4)
- [ ] Camera integration for photos
- [ ] Swipe navigation between dates
- [ ] Mobile calendar with touch gestures
- [ ] Haptic feedback implementation
- [ ] Bottom navigation bar

### Phase 3: Mobile Polish (Week 5-6)
- [ ] Biometric authentication
- [ ] Home screen widgets (iOS/Android)
- [ ] Push notifications
- [ ] Voice-to-text integration
- [ ] Mobile-optimized AI chat

### Phase 4: Mobile Optimization (Week 7-8)
- [ ] Performance optimization for low-end devices
- [ ] Advanced offline sync
- [ ] Battery usage optimization
- [ ] Mobile-specific settings
- [ ] Cross-device sync

## 10. Mobile Success Metrics

### Mobile-Specific KPIs
- **Mobile DAU**: 70% of total daily active users
- **PWA Installs**: 40% of mobile users install PWA
- **Mobile Session Length**: Average 5+ minutes
- **Offline Usage**: 20% of entries written offline
- **Photo Uploads**: 60% from mobile devices
- **Load Time**: <2s on average 4G connection
- **Crash Rate**: <0.1% on mobile devices

## 11. Mobile Testing Strategy

### Device Coverage
- **iOS**: iPhone 12 mini to 15 Pro Max
- **Android**: Pixel 4a to latest, Samsung Galaxy series
- **Tablets**: iPad Mini to Pro, Android tablets
- **Progressive Enhancement**: Works on older devices

### Test Scenarios
- Offline writing and sync
- Low battery mode
- Poor network conditions
- Keyboard types and sizes
- Gesture conflicts
- Memory pressure
- Background/foreground transitions

## 12. Definition of Done (Mobile MVP)

### Mobile Excellence Checklist
- [ ] Installs as PWA in <10 seconds
- [ ] Opens to today's entry in <2 seconds on 4G
- [ ] Keyboard never covers writing area
- [ ] Photos upload with progress indicator
- [ ] Swipe navigation feels native
- [ ] Works fully offline for 7 days
- [ ] Syncs seamlessly when back online
- [ ] Haptic feedback enhances interactions
- [ ] Font size adjustable with pinch
- [ ] One-thumb navigation possible
- [ ] Streak widget updates in real-time
- [ ] Voice input works reliably

### Mobile Delight Criteria 🎉
When your girlfriend can:
1. Journal during her commute without frustration
2. Capture and add photos instantly
3. Never lose a thought due to connection issues
4. Feel the app is as smooth as native apps
5. Access everything with one thumb
6. Get gentle reminders without annoyance

Then the mobile experience is truly complete! 📱✨

---

## Appendix A: Mobile Component Structure

```
src/
├── app/
│   ├── (mobile)/
│   │   ├── components/
│   │   │   ├── BottomNav.tsx
│   │   │   ├── MobileHeader.tsx
│   │   │   └── SwipeableViews.tsx
│   │   └── layouts/
│   │       └── MobileLayout.tsx
│   ├── manifest.json
│   └── service-worker.js
├── components/
│   ├── mobile/
│   │   ├── editor/
│   │   │   ├── MobileEditor.tsx
│   │   │   ├── KeyboardToolbar.tsx
│   │   │   └── VoiceInput.tsx
│   │   ├── calendar/
│   │   │   ├── TouchCalendar.tsx
│   │   │   └── CalendarWidget.tsx
│   │   ├── polaroids/
│   │   │   ├── CameraCapture.tsx
│   │   │   ├── PhotoCarousel.tsx
│   │   │   └── ImageCompressor.tsx
│   │   └── gestures/
│   │       ├── SwipeHandler.tsx
│   │       └── PinchZoom.tsx
│   └── shared/
│       └── ResponsiveContainer.tsx
├── hooks/
│   ├── useMobileKeyboard.ts
│   ├── useOfflineSync.ts
│   ├── useHaptic.ts
│   └── useDeviceInfo.ts
├── lib/
│   ├── pwa/
│   │   ├── install.ts
│   │   └── notifications.ts
│   └── mobile/
│       ├── storage.ts
│       └── webp-converter.ts
└── styles/
    ├── mobile.css
    └── responsive.css
```

---

Ready to build the most delightful mobile journaling experience! 📱🌟