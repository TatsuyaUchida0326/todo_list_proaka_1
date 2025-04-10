import React, { useState, useEffect } from 'react';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from './api';

export interface Todo {
  content: string;
  readonly id: number;
  completed_flg: boolean;
  delete_flg: boolean;
}

type Filter = 'all' | 'completed' | 'unchecked' | 'delete';

const Todo: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const isFormDisabled = filter === 'completed' || filter === 'delete';

  // 初回マウント時にTodo一覧をAPIから取得
  useEffect(() => {
    fetchTodos().then(data => setTodos(data));
  }, []);

  // 新しいTodoを作成する
  const handleSubmit = () => {
    if (!text) return;

    const newTodo: Omit<Todo, 'id'> = {
      content: text,
      completed_flg: false,
      delete_flg: false,
    };

    createTodo(newTodo).then(data => {
      setTodos((prevTodos) => [data, ...prevTodos]);
      setText('');
    });
  };

  // Todoの特定のプロパティを更新（編集・完了・削除）
  const handleTodo = <K extends keyof Todo, V extends Todo[K]>(
    id: number,
    key: K,
    value: V
  ) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, [key]: value } : todo
    );

    setTodos(updatedTodos);

    const todo = updatedTodos.find(todo => todo.id === id);
    if (todo) {
      updateTodo(id, todo);
    }
  };

  // 削除済みのTodoを物理削除
  const handleEmpty = () => {
    const filteredTodos = todos.filter(todo => !todo.delete_flg);
    const deletePromises = todos
      .filter(todo => todo.delete_flg)
      .map(todo => deleteTodo(todo.id));

    Promise.all(deletePromises).then(() => setTodos(filteredTodos));
  };

  // フィルター適用済みTodoリストを取得
  const getFilteredTodos = () => {
    switch (filter) {
      case 'completed':
        return todos.filter(todo => todo.completed_flg && !todo.delete_flg);
      case 'unchecked':
        return todos.filter(todo => !todo.completed_flg && !todo.delete_flg);
      case 'delete':
        return todos.filter(todo => todo.delete_flg);
      default:
        return todos.filter(todo => !todo.delete_flg);
    }
  };

  const handleFilterChange = (filter: Filter) => {
    setFilter(filter);
  };

  return (
    <div className="todo-container">
      <select
        defaultValue="all"
        onChange={(e) => handleFilterChange(e.target.value as Filter)}
      >
        <option value="all">すべてのタスク</option>
        <option value="completed">完了したタスク</option>
        <option value="unchecked">現在のタスク</option>
        <option value="delete">ごみ箱</option>
      </select>

      {filter === 'delete' ? (
        <button onClick={handleEmpty}>ごみ箱を空にする</button>
      ) : (
        filter !== 'completed' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isFormDisabled}
            />
            <button type="submit" disabled={isFormDisabled}>追加</button>
          </form>
        )
      )}

      <ul>
        {getFilteredTodos().map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              disabled={todo.delete_flg}
              checked={todo.completed_flg}
              onChange={() => handleTodo(todo.id, 'completed_flg', !todo.completed_flg)}
            />
            <input
              type="text"
              value={todo.content}
              disabled={todo.completed_flg || todo.delete_flg}
              onChange={(e) => handleTodo(todo.id, 'content', e.target.value)}
            />
            <button onClick={() => handleTodo(todo.id, 'delete_flg', !todo.delete_flg)}>
              {todo.delete_flg ? '復元' : '削除'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Todo;
