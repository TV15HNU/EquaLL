// src/components/GroupView.jsx
import React, { useEffect, useState } from 'react';
import EventForm from './EventForm';
import SettlementSummary from './SettlementSummary';
import { getEvents, getPeople, addPerson } from '../api';

export default function GroupView({ group, refresh, darkMode }) {
  const [events, setEvents] = useState([]);
  const [people, setPeople] = useState(group.people || []);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const bgColor = darkMode ? '#2a2a2a' : '#fff';
  const borderColor = darkMode ? '#444' : '#eee';
  const textColor = darkMode ? '#e0e0e0' : '#000';
  const mutedColor = darkMode ? '#999' : '#555';

  useEffect(() => {
    // refresh people from backend
    getPeople(group.id).then(setPeople).catch(() => setPeople(group.people || []));
    getEvents(group.id).then(setEvents);
  }, [group.id]);

  async function addNewPerson() {
    if (!nameInput.trim()) return;
    await addPerson(group.id, nameInput.trim());
    setNameInput('');
    // reload
    const gp = await getPeople(group.id);
    const evs = await getEvents(group.id);
    setPeople(gp);
    setEvents(evs);
    if (refresh) refresh();
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr 360px', gap: 16 }}>
      <aside style={{ border: `1px solid ${borderColor}`, padding: 12, borderRadius: 8, backgroundColor: bgColor }}>
        <h3 style={{ color: textColor }}>{group.name}</h3>
        <p style={{ color: textColor }}><strong>Members</strong></p>
        <ul style={{ color: textColor }}>
          {people.map(p => <li key={p.id}>{p.name}</li>)}
        </ul>

        <div style={{ marginTop: 12 }}>
          <input
            placeholder="Add member"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              boxSizing: 'border-box',
              backgroundColor: darkMode ? '#333' : '#fff',
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: 4,
            }}
          />
          <button
            onClick={addNewPerson}
            style={{
              marginLeft: 6,
              padding: '6px 12px',
              backgroundColor: '#0891b2',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Add
          </button>
        </div>
      </aside>

      <main style={{ border: `1px solid ${borderColor}`, padding: 12, borderRadius: 8, backgroundColor: bgColor }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: textColor }}>Events</h2>
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#0891b2',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            + Add Event
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          {events.length === 0 && <p style={{ color: mutedColor }}>No events yet</p>}
          {events.map(ev => (
            <div key={ev.id} style={{
              padding: 10,
              borderBottom: `1px solid ${borderColor}`,
              color: textColor,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{ev.title}</strong>
                <span>₹{Number(ev.amount).toFixed(2)}</span>
              </div>
              <div style={{ fontSize: 13, color: mutedColor, marginTop: 6 }}>
                Paid by: {ev.payer?.name || '—'}
              </div>
              <div style={{ marginTop: 6, color: mutedColor }}>
                Participants: {ev.participants?.map(p => p.person?.name).join(', ')}
              </div>
            </div>
          ))}
        </div>
      </main>

      <aside style={{ border: `1px solid ${borderColor}`, padding: 12, borderRadius: 8, backgroundColor: bgColor }}>
        <SettlementSummary groupId={group.id} people={people} darkMode={darkMode} />
      </aside>

      {editing && (
        <EventForm
          groupId={group.id}
          people={people}
          onClose={() => { setEditing(false); getEvents(group.id).then(setEvents); }}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
