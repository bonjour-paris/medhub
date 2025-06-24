import React, { useState, useEffect } from 'react';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'pending'

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskName) => {
    if (!taskName.trim()) return;
    setTasks(prev => [
      ...prev,
      { id: Date.now(), name: taskName, completed: false }
    ]);
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleComplete = (id) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // NEW: Edit task handler
  const editTask = (id, newName) => {
    if (!newName.trim()) return; // no empty edits allowed
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, name: newName } : task
    ));
  };

  // NEW: Filter tasks based on filter state
  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true; // all
  });

  return (
    <div className="app-container" style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <h1>ToDo List - {new Date().toLocaleDateString()}</h1>

      <TodoInput addTask={addTask} />

      {/* Filter Buttons */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setFilter('all')} disabled={filter === 'all'}>All</button>
        <button onClick={() => setFilter('completed')} disabled={filter === 'completed'} style={{ marginLeft: 10 }}>Completed</button>
        <button onClick={() => setFilter('pending')} disabled={filter === 'pending'} style={{ marginLeft: 10 }}>Pending</button>
      </div>

      <TodoList
        tasks={filteredTasks}
        toggleComplete={toggleComplete}
        deleteTask={deleteTask}
        editTask={editTask}  // pass edit handler
      />

      <p>Total tasks: {tasks.length}</p>
    </div>
  );
}

export default App;
