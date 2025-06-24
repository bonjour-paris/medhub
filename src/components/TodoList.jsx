import React from 'react';
import TodoItem from './TodoItem';

export default function TodoList({ tasks, toggleComplete, deleteTask, editTask }) {
  if (tasks.length === 0) return <p>No tasks, go chill!!!</p>;

  return (
    <div>
      {tasks.map(task => (
        <TodoItem
          key={task.id}
          task={task}
          toggleComplete={toggleComplete}
          deleteTask={deleteTask}
          editTask={editTask}  // new prop
        />
      ))}
    </div>
  );
}
