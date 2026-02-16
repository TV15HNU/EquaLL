// src/components/EventForm.jsx
import React, { useState } from 'react';
import ParticipantSelector from './ParticipantSelector';
import { createEventWithParticipants } from '../api';

export default function EventForm({ groupId, people, onClose }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState(people?.[0]?.id || null);
  const [selected, setSelected] = useState(() => people?.map(p => ({ personId: p.id, include: true })) || []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return alert('Enter title');
    if (!amount || Number(amount) <= 0) return alert('Enter valid amount');
    if (!payerId) return alert('Choose payer');

    const participantsArr = (selected || [])
      .filter(s => s.include)
      .map(s => ({ personId: s.personId })); // no share

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
      background: 'rgba(0,0,0,0.35)'
    }}>
      <form onSubmit={handleSubmit} style={{ background:'#fff', padding:20, borderRadius:8, width:600 }}>
        <h3>Add event</h3>
        <div style={{ display:'grid', gridTemplateColumns: '1fr 160px', gap: 8 }}>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Expense title" />
          <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount" />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Paid by: </label>
          <select value={payerId || ''} onChange={e=>setPayerId(Number(e.target.value))}>
            {people.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <ParticipantSelector people={people} selected={selected} onChange={setSelected} />
        </div>

        <div style={{ marginTop: 12, display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Save & Calculate</button>
        </div>
      </form>
    </div>
  );
}
