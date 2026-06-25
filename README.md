# Todo List

Small Todo List app for the Linear project `test_linear_todo_app`.

## Linear Scope

- `PIA-15` Initialize Todo List project
- `PIA-16` Show the task list and empty state
- `PIA-17` Add new todos
- `PIA-18` Toggle completed / active state
- `PIA-19` Delete todos
- `PIA-20` Persist todos in local storage
- `PIA-21` Add baseline tests
- `PIA-22` Release check

## Requirements

- Node.js 20 or newer
- npm

## Install

```bash
npm install
```

## Start

```bash
npm run dev
```

Vite prints the local URL after startup, usually `http://localhost:5173/`.

## Test

```bash
npm test
```

## Build

```bash
npm run build
```

## Manual Acceptance Checklist

- Add a todo with non-empty text.
- Confirm blank input cannot be added.
- Toggle a todo between active and completed.
- Delete one todo and confirm the rest stay visible.
- Refresh the page and confirm todos and completion state are restored.
- Delete all todos and confirm the empty state is shown.
