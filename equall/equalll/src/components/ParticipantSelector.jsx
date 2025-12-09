// src/components/ParticipantSelector.jsx
import React from 'react';

/**
 * props:
 *  - people: array [{id, name}]
 *  - selected: array [{ personId, share, include }]
 *  - onChange(selectedArray)
 *  - darkMode: boolean
 */
export default function ParticipantSelector({ people, selected, onChange, darkMode }) {
  // ensure selected has an entry for each person
  const merged = people.map(p => {
    const existing = (selected || []).find(s => s.personId === p.id);
    return { personId: p.id, name: p.name, include: existing ? existing.include !== false : true, share: existing?.share ?? 1};
  });

  const textColor = darkMode ? '#e0e0e0' : '#333';
  const borderColor = darkMode ? '#444' : '#ddd';
  const inputBgColor = darkMode ? '#333' : '#fff';

  function toggle(personId) {
    const copy = merged.map(m => m.personId === personId ? { ...m, include: !m.include } : m);
    onChange(copy);
  }

  function setShare(personId, value) {
    const copy = merged.map(m => m.personId === personId ? { ...m, share: value } : m);
    onChange(copy);
  }

  return (
    <div>
      <div style={{ fontSize: 13, marginBottom: 8, color: textColor }}>Select participants and (optional) share</div>
      <div style={{ display:'grid', gap:8 }}>
        {merged.map(m => (
          <div key={m.personId} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <input type="checkbox" checked={m.include} onChange={() => toggle(m.personId)} />
            <div style={{ flex: 1, color: textColor }}>{m.name}</div>
            <div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={m.share}
                onChange={e => setShare(m.personId, Number(e.target.value || 0))}
                style={{
                  width: 80,
                  padding: '4px 8px',
                  backgroundColor: inputBgColor,
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
