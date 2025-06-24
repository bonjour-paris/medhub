import React, { useState } from 'react';

export default function TodoInput({ addTask }) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    addTask(input);
    setInput('');
  };

  const onEnter = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <input 
        type="text" 
        value={input} 
        onChange={e => setInput(e.target.value)} 
        onKeyDown={onEnter}
        placeholder="Add a new task..."
        style={{ padding: 8, width: '70%' }}
      />
      <button onClick={handleAdd} style={{ padding: '8px 12px', marginLeft: 10 }}>
        Add Task
      </button>
    </div>
  );
}
