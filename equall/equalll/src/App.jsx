// src/App.jsx
import React, { useEffect, useState } from 'react';
import GroupView from './components/GroupView';
import HomePage from './components/HomePage';
import { createGroup, getGroup } from './api';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [groupId, setGroupId] = useState(null);
  const [group, setGroup] = useState(null);

  useEffect(() => {
    if (!groupId) return;
    getGroup(groupId).then(setGroup).catch(() => setGroup(null));
  }, [groupId]);

  async function handleStartGroup(numPeople, groupName) {
    try {
      const g = await createGroup(groupName.trim());
      setGroupId(g.id);
      setGroup(g);
    } catch (err) {
      alert('Error creating group: ' + err.message);
    }
  }

  const bgColor = darkMode ? '#1e1e1e' : '#fff';
  const textColor = darkMode ? '#e0e0e0' : '#000';
  const borderColor = darkMode ? '#333' : '#ddd';

  return (
    <div style={{
      fontFamily: 'Inter, system-ui, sans-serif',
      backgroundColor: bgColor,
      color: textColor,
      minHeight: '100vh',
      transition: 'background-color 0.3s, color 0.3s',
    }}>
      {/* Dark mode toggle */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
      }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 600,
            border: `1px solid ${borderColor}`,
            borderRadius: 4,
            backgroundColor: darkMode ? '#2a2a2a' : '#f0f0f0',
            color: textColor,
            cursor: 'pointer',
          }}
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {!group ? (
        <HomePage
          onStart={handleStartGroup}
          onShowExample={() => {
            setGroupId(1);
          }}
          darkMode={darkMode}
        />
      ) : (
        <div style={{ padding: 24 }}>
          <header style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 18,
            justifyContent: 'space-between',
          }}>
            <h1 style={{ margin: 0 }}>Equall — Split bills like Billzer</h1>
            <button
              onClick={() => { setGroupId(null); setGroup(null); }}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                backgroundColor: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              ← Back to Home
            </button>
          </header>

          <GroupView
            group={group}
            refresh={() => getGroup(groupId).then(setGroup)}
            darkMode={darkMode}
          />
        </div>
      )}
    </div>
  );
}
