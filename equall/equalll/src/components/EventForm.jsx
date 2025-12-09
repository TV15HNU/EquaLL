// src/components/EventForm.jsx
import React, { useState } from 'react';
import ParticipantSelector from './ParticipantSelector';
import { createEventWithParticipants } from '../api';

export default function EventForm({ groupId, people, onClose, darkMode }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState(people?.[0]?.id || null);
  const [selected, setSelected] = useState(() => people?.map(p => ({ personId: p.id, share: 1 })) || []);

  const bgColor = darkMode ? '#2a2a2a' : '#fff';
  const textColor = darkMode ? '#e0e0e0' : '#000';
  const borderColor = darkMode ? '#444' : '#ddd';
  const inputBgColor = darkMode ? '#333' : '#fff';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return alert('Enter title');
    if (!amount || Number(amount) <= 0) return alert('Enter valid amount');
    if (!payerId) return alert('Choose payer');

    // participants array from selected state
    const participantsArr = selected.filter(s => s.include !== false).map(s => ({ personId: s.personId, share: s.share || 1}));
    try {
      await createEventWithParticipants(groupId, { title, amount: Number(amount), payerId }, participantsArr);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to add event: ' + (err?.message || 'unknown'));
    }
  }

  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, top:0, bottom:0, display:'flex', alignItems:'center', justifyContent:'center',
      background: 'rgba(0,0,0,0.5)'
    }}>
      <form onSubmit={handleSubmit} style={{
        background: bgColor,
        color: textColor,
        padding: 20,
        borderRadius: 8,
        width: 600,
        border: `1px solid ${borderColor}`,
      }}>
        <h3>Add event</h3>
        <div style={{ display:'grid', gridTemplateColumns: '1fr 160px', gap: 8 }}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Expense title"
            style={{
              padding: '8px',
              backgroundColor: inputBgColor,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: 4,
            }}
          />
          <input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Amount"
            style={{
              padding: '8px',
              backgroundColor: inputBgColor,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: 4,
            }}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <label style={{ color: textColor }}>Paid by: </label>
          <select
            value={payerId || ''}
            onChange={e => setPayerId(Number(e.target.value))}
            style={{
              padding: '6px 8px',
              backgroundColor: inputBgColor,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: 4,
              marginLeft: 8,
            }}
          >
            {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <ParticipantSelector people={people} selected={selected} onChange={setSelected} darkMode={darkMode} />
        </div>

        <div style={{ marginTop: 12, display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: darkMode ? '#444' : '#e0e0e0',
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              backgroundColor: '#0891b2',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Save & Calculate
          </button>
        </div>
      </form>
    </div>
  );
}
