import { FormEvent, useEffect, useMemo, useState } from 'react';

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

const STORAGE_KEY = 'test-linear-todo-app.todos';

function createTodo(text: string): Todo {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id,
    text,
    completed: false
  };
}

export function loadTodos(storage: Storage = window.localStorage): Todo[] {
  try {
    const rawTodos = storage.getItem(STORAGE_KEY);
    if (!rawTodos) return [];

    const parsed = JSON.parse(rawTodos);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (todo): todo is Todo =>
          typeof todo?.id === 'string' &&
          typeof todo?.text === 'string' &&
          typeof todo?.completed === 'boolean'
      )
      .map((todo) => ({
        ...todo,
        text: todo.text.trim()
      }))
      .filter((todo) => todo.text.length > 0);
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[], storage: Storage = window.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Persistence is best effort; the app should remain usable if storage fails.
  }
}

export function App() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());
  const [draft, setDraft] = useState('');

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const remainingCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draft.trim();
    if (!text) return;

    setTodos((currentTodos) => [createTodo(text), ...currentTodos]);
    setDraft('');
  }

  function toggleTodo(id: string) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  function deleteTodo(id: string) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  }

  return (
    <main className="app-shell">
      <section className="todo-panel" aria-labelledby="todo-title">
        <header className="todo-header">
          <div>
            <p className="eyebrow">Linear PIA-15 to PIA-22</p>
            <h1 id="todo-title">Todo List</h1>
          </div>
          <p className="todo-count" aria-live="polite">
            {remainingCount} active
          </p>
        </header>

        <form className="todo-form" onSubmit={handleSubmit}>
          <label htmlFor="todo-input">New todo</label>
          <div className="todo-entry">
            <input
              id="todo-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add a focused task"
              autoComplete="off"
            />
            <button type="submit" disabled={!draft.trim()}>
              Add
            </button>
          </div>
        </form>

        {todos.length === 0 ? (
          <div className="empty-state" role="status">
            <h2>No todos yet</h2>
            <p>Add your first todo to start tracking work.</p>
          </div>
        ) : (
          <ul className="todo-list" aria-label="Todo list">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={todo.completed ? 'todo-item is-complete' : 'todo-item'}
              >
                <label className="todo-check">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span>{todo.text}</span>
                </label>
                <button
                  className="delete-button"
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label={`Delete ${todo.text}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
