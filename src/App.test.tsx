import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App, loadTodos, saveTodos } from './App';

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('shows an empty state before any todos exist', () => {
    render(<App />);

    expect(screen.getByText('No todos yet')).toBeInTheDocument();
    expect(screen.getByText('0 active')).toBeInTheDocument();
  });

  it('adds a todo and clears the input', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText('New todo');
    await user.type(input, 'Write release notes');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Write release notes')).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(screen.getByText('1 active')).toBeInTheDocument();
  });

  it('does not add blank todos', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('New todo'), '   ');

    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    expect(screen.getByText('No todos yet')).toBeInTheDocument();
  });

  it('toggles completion without changing other todos', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('New todo'), 'First todo');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.type(screen.getByLabelText('New todo'), 'Second todo');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await user.click(screen.getByLabelText('First todo'));

    expect(screen.getByLabelText('First todo')).toBeChecked();
    expect(screen.getByLabelText('Second todo')).not.toBeChecked();
    expect(screen.getByText('1 active')).toBeInTheDocument();

    await user.click(screen.getByLabelText('First todo'));

    expect(screen.getByLabelText('First todo')).not.toBeChecked();
    expect(screen.getByText('2 active')).toBeInTheDocument();
  });

  it('deletes one todo without affecting the others', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('New todo'), 'Keep this');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.type(screen.getByLabelText('New todo'), 'Delete this');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await user.click(screen.getByRole('button', { name: 'Delete Delete this' }));

    expect(screen.queryByText('Delete this')).not.toBeInTheDocument();
    expect(screen.getByText('Keep this')).toBeInTheDocument();
  });

  it('persists todos and reloads them from local storage', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.type(screen.getByLabelText('New todo'), 'Persistent todo');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.click(screen.getByLabelText('Persistent todo'));

    unmount();
    render(<App />);

    expect(screen.getByText('Persistent todo')).toBeInTheDocument();
    expect(screen.getByLabelText('Persistent todo')).toBeChecked();
    expect(screen.getByText('0 active')).toBeInTheDocument();
  });
});

describe('storage helpers', () => {
  it('returns an empty list when stored data is invalid', () => {
    window.localStorage.setItem('test-linear-todo-app.todos', '{bad json');

    expect(loadTodos()).toEqual([]);
  });

  it('keeps the app usable when storage writes fail', () => {
    const storage = {
      getItem: vi.fn(),
      setItem: vi.fn(() => {
        throw new Error('storage unavailable');
      }),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    };

    expect(() =>
      saveTodos([{ id: '1', text: 'Local only', completed: false }], storage)
    ).not.toThrow();
  });
});
