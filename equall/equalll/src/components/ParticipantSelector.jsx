// src/components/ParticipantSelector.jsx
import React from 'react';

/**
 * New simplified selector:
 * props:
 *  - people: array [{id, name}]
 *  - selected: array [{ personId, include }]
 *  - onChange(selectedArray)
 *
 * selected form: for each person -> { personId, include: true/false }
 */
export default function ParticipantSelector({ people, selected, onChange }) {
  // build merged list
  const merged = people.map(p => {
    const existing = (selected || []).find(s => s.personId === p.id);
    return { personId: p.id, name: p.name, include: existing ? !!existing.include : true };
  });

  function toggle(personId) {
    const copy = merged.map(m => m.personId === personId ? { ...m, include: !m.include } : m);
    onChange(copy);
  }

  return (
    <div>
      <div style={{ fontSize: 13, marginBottom: 8 }}>Select participants involved in this expense</div>
      <div style={{ display: 'grid', gap: 8 }}>
        {merged.map(m => (
          <label key={m.personId} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <input type="checkbox" checked={m.include} onChange={() => toggle(m.personId)} />
            <span>{m.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
