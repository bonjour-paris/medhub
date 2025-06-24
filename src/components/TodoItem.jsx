import React, { useState } from 'react';

export default function TodoItem({ task, toggleComplete, deleteTask, editTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.name);

  const handleSave = () => {
    if (editText.trim()) {
      editTask(task.id, editText);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(task.name);
    setIsEditing(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
        borderBottom: '1px solid #eee',
        color: task.completed ? 'gray' : 'black',
      }}
    >
      {/* Left side: Checkbox and task name / edit input */}
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => !isEditing && toggleComplete(task.id)} title="Click to toggle complete">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleComplete(task.id)}
          onClick={e => e.stopPropagation()}
          style={{ marginRight: 8 }}
        />
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            autoFocus
            style={{ padding: 4, fontSize: 16, width: 200 }}
          />
        ) : (
          <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.name}</span>
        )}
      </div>

      {/* Right side: buttons */}
      <div>
        {isEditing ? (
          <>
            <button onClick={handleSave} style={{ marginRight: 8 }}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} style={{ marginRight: 8 }}>Edit</button>
            <button
              onClick={() => deleteTask(task.id)}
              style={{ background: 'red', color: 'white', border: 'none', borderRadius: 4, padding: '0 6px', cursor: 'pointer' }}
              aria-label={`Delete task ${task.name}`}
            >
              X
            </button>
          </>
        )}
      </div>
    </div>
  );
}
