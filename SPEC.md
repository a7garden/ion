# SNS Web Page Specification

## 1. Project Overview
- **Project Name**: Simple SNS
- **Type**: Single Page Web Application
- **Core Feature**: Anonymous social feed with like-only interaction, friend management, and theme toggle
- **Target Users**: General users seeking simple anonymous social interaction

## 2. UI/UX Specification

### Layout Structure
- **Header** (fixed top, height: 60px)
  - Logo/Brand on left
  - 3 ghost buttons on right: Login, White Mode, Black Mode, Slider
- **Main Content**
  - Friend sidebar (left, collapsible, width: 280px)
  - Post feed (center, max-width: 600px, centered)
- **Footer**: None

### Visual Design

#### Color Palette
**White Mode**
- Background: `#FFFFFF`
- Text Primary: `#1A1A1A`
- Text Secondary: `#6B7280`
- Border: `#E5E7EB`
- Card Background: `#F9FAFB`

**Black Mode**
- Background: `#0F0F0F`
- Text Primary: `#F5F5F5`
- Text Secondary: `#9CA3AF`
- Border: `#2D2D2D`
- Card Background: `#1A1A1A`

**Accent Colors**
- Heart Active: `#EF4444` (red-500)
- Heart Inactive: `#D1D5DB` (gray-300)
- Ghost Button Border: `currentColor`
- Ghost Button Hover: `rgba(0,0,0,0.05)` (white mode) / `rgba(255,255,255,0.1)` (black mode)

#### Typography
- Font Family: `'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Header Logo: 20px, font-weight: 700
- Post Author ID: 14px, font-weight: 600
- Post Content: 15px, font-weight: 400, line-height: 1.6
- Button Text: 13px, font-weight: 500

#### Spacing System
- Base unit: 8px
- Card padding: 20px
- Card margin-bottom: 16px
- Card border-radius: 12px

### Components

#### Header
- Fixed position, z-index: 100
- Background matches current theme
- Border-bottom: 1px solid border color
- Brand text on left
- Button group on right (gap: 12px)

#### Ghost Buttons
- Background: transparent
- Border: 1px solid currentColor
- Border-radius: 8px
- Padding: 8px 16px
- Transition: all 0.2s ease
- Hover: background opacity change

#### Post Card
- Background: card background color
- Border: 1px solid border color
- Border-radius: 12px
- Box-shadow: none (flat design)
- Contains: author ID only (no avatar), heart button

#### Heart Button
- Size: 24px × 24px
- Inactive: outlined heart (stroke only, gray)
- Active: filled heart (solid red)
- Cursor: pointer
- Transition: transform 0.2s ease

#### Friend Sidebar
- Collapsible via slider button
- Friend list with name and delete button
- Add friend input + button

### Animations
- Heart fill: scale 1 → 1.2 → 1 (0.2s)
- Theme transition: background 0.3s ease, color 0.3s ease
- Sidebar slide: transform 0.3s ease

## 3. Functional Specification

### Core Features

#### 1. Anonymous Post Feed
- Display 5-10 randomly generated posts on load
- Each post shows only author ID (e.g., "user_1234")
- Posts are shuffled on each page load
- No post content, only author and like button (simulated posts with random content)

#### 2. Like System
- Click empty heart → filled red heart (toggle)
- No like count displayed anywhere
- No list of users who liked
- Like action triggers notification to author (simulated)
- State persists in localStorage per user session

#### 3. Friend Management
- Add friend by ID input
- Remove friend with delete button
- Friends stored in localStorage
- Friend list displayed in collapsible sidebar

#### 4. Theme Toggle
- White Mode: Light background, dark text
- Black Mode: Dark background, light text
- Stored in localStorage
- Smooth transition animation

#### 5. Login Button
- Ghost button style
- Shows alert "Login feature coming soon"
- No actual authentication (frontend only)

#### 6. Slider Button
- Toggles friend sidebar visibility
- Icon changes based on state (open/closed)

### User Interactions
- Click heart → toggle like state
- Click theme button → switch theme
- Click login → show alert
- Click slider → toggle sidebar
- Type friend ID + click add → add to friend list
- Click delete on friend → remove from list

### Data Model
```javascript
{
  posts: [
    { id: string, authorId: string, content: string, isLiked: boolean }
  ],
  friends: [ { id: string, name: string } ],
  theme: 'white' | 'black',
  sidebarOpen: boolean
}
```

### Edge Cases
- Empty friend list: show "No friends yet" message
- Duplicate friend add: prevent and show message
- LocalStorage unavailable: app works without persistence

## 4. Acceptance Criteria

### Visual Checkpoints
- [ ] Header displays with 3 ghost buttons aligned right
- [ ] Ghost buttons have transparent background with border
- [ ] Posts display with author ID and heart button only
- [ ] Empty heart is gray outlined, filled heart is red
- [ ] White mode has white background, black mode has dark background
- [ ] Friend sidebar slides in/out smoothly
- [ ] Theme transition is smooth (0.3s)

### Functional Checkpoints
- [ ] Heart toggles between empty and filled on click
- [ ] Like count not visible anywhere
- [ ] Theme persists after page reload
- [ ] Friends can be added and deleted
- [ ] Friend list persists after page reload
- [ ] Login button shows alert
- [ ] Slider toggles sidebar visibility
- [ ] Sidebar state persists after page reload
