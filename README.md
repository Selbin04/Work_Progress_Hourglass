# Hourglass

A small work-progress app I made for fun / entertainment.

I didn’t hand-write this whole thing myself — I built it **completely with AI** (Cursor). I asked for features, tested them, and steered what I wanted. So treat it as an AI-assisted side project, not as proof that I wrote every line from scratch.

It’s not a countdown timer. The hourglass shows how much work I’ve finished on a project. I hold **POUR** when I’m working, and the sand fills up as progress.

## What it does

- Create projects and track progress with the hourglass
- Move important ones to the **Important** panel (star them, up to 5 stars for priority)
- Double-click a project in Important / Projects to list the works to do
- On the first open of the day, it shows incomplete Important projects one by one
  - **Select** → pick which works to do today → goes to **Selected**
  - Click outside → skip that project
  - **Previous** if I skip by mistake
- Double-click something in **Selected** to see only today’s works

## Stack

- **Client:** React + Vite
- **Server:** Express
- **Data:** MongoDB if it’s running, otherwise a local JSON file (`server/data/projects.json`)

I mostly use the JSON file right now because Mongo isn’t always on.

## How to run

Need Node.js installed.

```bash
npm run install:all
npm run dev
```

Then open: http://localhost:5173/

On Windows I also use `start-hourglass.bat` (desktop shortcut). Keep that window open while using the app.

## Setup

Copy `server/.env.example` to `server/.env` and change if you need:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hourglass
DATA_DIR=data
PROJECTS_FILE=projects.json
```

## Notes

- My real project names / topics stay in `server/data/` and `.env` — those are in `.gitignore` on purpose
- If the app won’t start, something might still be using ports 5000 or 5173 from a previous run. Closing the old console window (or using the bat file) usually fixes it

## Folder layout

```
client/   → React UI
server/   → API + store
start-hourglass.bat → quick start on Windows
```
