# My Personal Dashboard

A one-page personal site with a to-do list (synced via Supabase), a vision board, and photos.
Tasks you add are saved to your database and appear on every device. Completed tasks move to a
"Completed" list with the date.

---

## What you need to do (3 parts)

### Part A — Put this on GitHub

1. Create a free account at github.com if you don't have one.
2. Create a new repository (e.g. `my-dashboard`). Leave it empty (no README).
3. On your computer, unzip this folder, open a terminal inside it, and run:

   ```
   git init
   git add .
   git commit -m "my dashboard"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/my-dashboard.git
   git push -u origin main
   ```

   Replace YOUR-USERNAME with your GitHub username.

### Part B — Deploy on Vercel

1. Go to vercel.com and sign up with your GitHub account.
2. Click "Add New… → Project", and import your `my-dashboard` repo.
3. Before clicking Deploy, open "Environment Variables" and add these TWO:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://mlnlhugjatcuhnzzrsnr.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (your anon key, the long eyJ… string) |

4. Click Deploy. After ~1 minute you get a live URL. Bookmark it on your phone and laptop.

That's it. Open the URL, add a task, and it saves. Refresh on your phone and it's there too.

---

## How to change your photos, vision board, and name

Open `lib/content.js`. Everything is editable there:
- Change your name and tagline at the top.
- Add vision board items: a label + an image URL.
- Add photos: just paste image URLs.

After editing, push to GitHub (`git add . && git commit -m "update" && git push`).
Vercel redeploys automatically in about a minute.

Tip for images: upload a photo to a free image host (e.g. imgur.com or postimages.org),
copy the direct image link (it should end in .jpg or .png), and paste it in.

---

## Daily use

- Add a task → type in the box, **pick a priority** (Urgent / Important / To-do), press Enter or Add.
- Tasks are grouped and colour-coded by priority: Urgent (red), Important (amber), To-do (green).
- Change a task's priority → hover over it and click the ⇅ icon (it cycles through the levels).
- Finish a task → click the circle. It moves to Completed with today's date.
- Remove a task → hover and click the ✕.

## Pre-loading your 9 immediate tasks (optional)

Open `setup-tasks.sql` (in this folder), copy all of it, paste into the Supabase SQL Editor,
and click Run. This adds a `priority` column and loads your 9 tasks with priorities set.
Tasks 8 and 9 are pre-marked as completed. Run this ONCE, before or after deploying.

Your tasks live in your Supabase database, so they're always current and synced everywhere.
