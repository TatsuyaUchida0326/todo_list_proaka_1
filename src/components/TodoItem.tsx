import React from 'react';
import { Todo } from '../types';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';

interface TodoItemProps {
  todo: Todo;
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
  updateTodo: (id: number, todo: Todo) => void;
  index: number;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  todos,
  setTodos,
  updateTodo,
  index,
  provided,
  snapshot
}) => {
  const handleTodoChange = <K extends keyof Todo, V extends Todo[K]>(
    id: number,
    key: K,
    value: V
  ) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, [key]: value } : todo
    );
    setTodos(updatedTodos);

    const updatedTodo = updatedTodos.find(todo => todo.id === id);
    if (updatedTodo) {
      updateTodo(id, updatedTodo);
    }
  };

  return (
    <li
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{
        ...provided.draggableProps.style,
        backgroundColor: snapshot.isDragging ? 'lightyellow' : 'white',
        padding: '0.5rem',
        marginBottom: '0.5rem',
        border: '1px solid #ccc',
        borderRadius: '6px',
        cursor: 'grab'
      }}
    >
      <input
        type="checkbox"
        disabled={todo.delete_flg}
        checked={todo.completed_flg}
        onChange={() => handleTodoChange(todo.id, 'completed_flg', !todo.completed_flg)}
      />
      <input
        type="text"
        disabled={todo.completed_flg || todo.delete_flg}
        value={todo.content}
        onChange={(e) => handleTodoChange(todo.id, 'content', e.target.value)}
      />
      <button onClick={() => handleTodoChange(todo.id, 'delete_flg', !todo.delete_flg)}>
        {todo.delete_flg ? '復元' : '削除'}
      </button>
    </li>
  );
};

export default TodoItem;
