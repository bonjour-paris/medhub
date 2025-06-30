import React from 'react';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import './App.css'; 

function App() {
  const currentDate = new Date().toLocaleDateString();

  return (
   <div className="app-container">
      <h1> Redux ToDo App</h1>
      <p>Today's date: {currentDate}</p>

      <div className="card">
        <TodoInput />
        <TodoList />
      </div>

      <p className="read-the-docs">
        Click  to toggle,  to delete a task.
      </p>
    </div>
  );
}

export default App;
