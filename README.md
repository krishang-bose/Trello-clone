# Trello Clone

A full-featured Trello-like project management app built with **Next.js 15**, **Supabase**, and **Clerk**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Shadcn UI |
| Database | Supabase (PostgreSQL) |
| Auth | Clerk |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Font | Nunito (Google Fonts) |

---

## Features Implemented

### ✅ Board Management
- Create a board with a custom title and colour (prompted on creation)
- View all boards in a Trello-style dashboard — board colour as card thumbnail
- Edit board title and colour from within the board
- Delete a board (and all its lists and cards) from the dashboard

### ✅ Lists Management
- Create new lists ("Add another list") on a board
- Edit list title via rename dialog
- Delete a list (removes all cards in it)

### ✅ Cards Management
- Create cards in any list using the "Add a card" button — dialog closes automatically on submit
- Set title, description, assignee, priority, and due date on creation
- Delete cards via hover trash icon on the card

### ✅ Card Details
- **Priority**: low / medium / high — shown as a coloured dot on every card
- **Due date**: shown on each card
- **Assignee**: shown on each card

### ✅ Drag & Drop
- Drag cards between lists
- Reorder cards within a list
- Smooth lift animation (card tilts + floats on drag)
- Dashed blue placeholder shows where the card came from
- Spring-like snap when a card is dropped

### ✅ Todo List Sidebar
- Left sidebar on the board page showing all tasks grouped by their list column
- Live task count
- Delete any task directly from the sidebar

### ✅ Search
- Search bar on the dashboard to filter boards by name
- (Card-level filtering supported via the existing assignee and due-date fields in the DB)

### ✅ Multi-board Support
- Each user has their own workspace with multiple boards

### ✅ Board Background Customisation
- 12 colour options for each board's background on the board settings dialog

### ✅ Responsive Design
- Works on mobile (sidebar hidden, single-column layout), tablet, and desktop

---

## Database Schema

```
boards
  id            uuid PK
  title         text
  description   text
  color         text          (Tailwind bg class, e.g. "bg-blue-500")
  user_id       text          (Clerk user ID)
  created_at    timestamp
  updated_at    timestamp

columns
  id            uuid PK
  board_id      uuid FK → boards.id
  title         text
  sort_order    integer
  created_at    timestamp

tasks
  id            uuid PK
  column_id     uuid FK → columns.id
  title         text
  description   text
  assignee      text
  priority      text          ("low" | "medium" | "high")
  due_date      text
  sort_order    integer
  labels        text[]        (array of colour strings)
  archived      boolean       default false
  checklist_items jsonb       ([{ id, text, completed }])
  created_at    timestamp
  updated_at    timestamp
```

---

## Setup Instructions

### 1. Clone and install

```bash
git clone <repo-url>
cd trello-clone
npm install
```

### 2. Environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=<your supabase project url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your supabase anon key>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your clerk publishable key>
CLERK_SECRET_KEY=<your clerk secret key>
```

### 3. Supabase setup

Run the following SQL in the Supabase SQL Editor to create tables and enable RLS:

```sql
-- Boards
create table boards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  color text default 'bg-blue-500',
  user_id text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Columns
create table columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade,
  title text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  column_id uuid references columns(id) on delete cascade,
  title text not null,
  description text,
  assignee text,
  priority text default 'medium',
  due_date text,
  sort_order integer default 0,
  labels text[] default '{}',
  archived boolean default false,
  checklist_items jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table boards enable row level security;
alter table columns enable row level security;
alter table tasks enable row level security;
```

Then add RLS policies with your `requesting_user_id()` function (backed by Clerk JWT).

### 4. Clerk setup

- Create a Clerk application and enable the **Supabase JWT template** in Clerk dashboard
- Add your Clerk keys to `.env.local`

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Assumptions

- A single user per account; no real-time multi-user collaboration
- "Archive" removes a card from view but does not hard-delete it (archived flag in DB)
- Board colours are Tailwind CSS class names stored as strings
- Drag-and-drop sort order is persisted to Supabase on every drop

---

Built by **Krishang Bose**
