// src/components/GroupView.jsx
import React, { useEffect, useState } from 'react';
import SettlementSummary from './SettlementSummary';
import { getEvents, getPeople, addPerson, updatePerson, createEventWithParticipants } from '../api';

export default function GroupView({ group, refresh, darkMode }) {
  const [events, setEvents] = useState([]);
  const [people, setPeople] = useState(group.people || []);
  const [nameInput, setNameInput] = useState('');
  const [editingPersonId, setEditingPersonId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const bgColor = darkMode ? '#1e1e1e' : '#f5f5f5';
  const cardBg = darkMode ? '#2a2a2a' : '#fff';
  const borderColor = darkMode ? '#444' : '#ddd';
  const textColor = darkMode ? '#e0e0e0' : '#000';
  const mutedColor = darkMode ? '#999' : '#666';

  useEffect(() => {
    getPeople(group.id).then(setPeople).catch(() => setPeople(group.people || []));
    getEvents(group.id).then(setEvents);
  }, [group.id]);

  // Inline transactions state
  const [transactions, setTransactions] = useState(() => (
    (group.people || []).map(p => ({
      id: `t-${p.id}`,
      payerId: p.id,
      title: '',
      amount: '',
      participants: (group.people || []).map(pp => pp.id),
      showParticipants: false,
    }))
  ));

  useEffect(() => {
    setTransactions(prev => {
      if (!people || people.length === 0) return [];
      return prev.length ? prev.map(t => ({ ...t, participants: Array.from(new Set([...(t.participants||[]), ...people.map(p=>p.id)])) })) :
        people.map(p => ({ id: `t-${p.id}`, payerId: p.id, title: '', amount: '', participants: people.map(pp=>pp.id), showParticipants: false }));
    });
  }, [people]);

  async function addNewPerson() {
    if (!nameInput.trim()) return;
    await addPerson(group.id, nameInput.trim());
    setNameInput('');
    const gp = await getPeople(group.id);
    const evs = await getEvents(group.id);
    setPeople(gp);
    setEvents(evs);
    if (refresh) refresh();
  }

  async function updatePersonName(personId, newName) {
    if (!newName.trim()) return;
    try {
      await updatePerson(group.id, personId, newName.trim());
      const gp = await getPeople(group.id);
      setPeople(gp);
      setEditingPersonId(null);
      setEditingName('');
    } catch (err) {
      console.error('Error updating person:', err);
    }
  }

  function updateTransaction(id, patch) {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    setValidationErrors(prev => ({ ...prev, [id]: undefined }));
  }

  const [validationErrors, setValidationErrors] = useState({});

  function removeTransaction(id) {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setValidationErrors(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
  }

  function toggleParticipantList(id) {
    updateTransaction(id, { showParticipants: !(transactions.find(t => t.id === id)?.showParticipants) });
  }

  function toggleParticipantForTransaction(txId, personId) {
    setTransactions(prev => prev.map(t => {
      if (t.id !== txId) return t;
      const has = (t.participants || []).includes(personId);
      const next = has ? (t.participants || []).filter(p => p !== personId) : [...(t.participants || []), personId];
      return { ...t, participants: next };
    }));
  }

  function addTransactionForPayer(payerId) {
    const id = `t-${Date.now()}`;
    setTransactions(prev => [...prev, { id, payerId, title: '', amount: '', participants: people.map(p=>p.id), showParticipants: false }]);
  }

  const anyPaymentEntered = transactions.some(t => Number(t.amount) > 0);
  const [saving, setSaving] = useState(false);

  async function handleCalculateAndSave() {
    const toCreate = transactions.filter(t => Number(t.amount) > 0);
    if (toCreate.length === 0) return setValidationErrors({ _global: 'Enter amounts before calculating.' });

    const errors = {};
    toCreate.forEach(t => {
      if (!t.payerId) errors[t.id] = 'Choose a payer for this expense.';
      else if (!t.participants || t.participants.length === 0) errors[t.id] = 'Select at least one participant.';
      else if (Number(t.amount) <= 0 || Number.isNaN(Number(t.amount))) errors[t.id] = 'Enter an amount greater than 0.';
    });
    if (Object.keys(errors).length) return setValidationErrors(errors);

    setSaving(true);
    setValidationErrors({});
    try {
      for (const t of toCreate) {
        const payload = { title: t.title || 'Expense', amount: Number(t.amount), payerId: t.payerId };
        const parts = (t.participants || []).map(pid => ({ personId: pid, include: true }));
        await createEventWithParticipants(group.id, payload, parts);
      }
      const evs = await getEvents(group.id);
      setEvents(evs);
      if (refresh) refresh();
      setTransactions(prev => prev.map(t => ({ ...t, title: '', amount: '', participants: people.map(p=>p.id) })));
    } catch (err) {
      console.error(err);
      setValidationErrors({ _global: 'Failed to save: ' + (err?.message || 'unknown') });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 20, padding: 20, backgroundColor: bgColor, minHeight: '100vh' }}>
      {/* Left column: People cards */}
      <div style={{ flex: '0 0 380px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div>
          <h3 style={{ color: textColor, marginBottom: 12, fontSize: 16, fontWeight: 600 }}>{group.name}</h3>
        </div>

        {/* Person cards */}
        {people.map(person => (
          <div key={person.id} style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 6,
            overflow: 'hidden',
          }}>
            {/* Person header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              backgroundColor: '#0891b2',
              color: '#fff',
              fontWeight: 600,
            }}>
              <div style={{
                width: 32,
                height: 32,
                backgroundColor: '#06b6d4',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}>
                👤
              </div>
              <input
                value={editingPersonId === person.id ? editingName : person.name}
                onChange={e => {
                  if (editingPersonId === person.id) setEditingName(e.target.value);
                }}
                onFocus={() => {
                  setEditingPersonId(person.id);
                  setEditingName(person.name);
                }}
                onBlur={() => {
                  if (editingPersonId === person.id && editingName !== person.name) {
                    updatePersonName(person.id, editingName);
                  } else {
                    setEditingPersonId(null);
                    setEditingName('');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updatePersonName(person.id, editingName);
                  } else if (e.key === 'Escape') {
                    setEditingPersonId(null);
                    setEditingName('');
                  }
                }}
                style={{
                  flex: 1,
                  border: editingPersonId === person.id ? '2px solid #fff' : 'none',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  padding: editingPersonId === person.id ? '4px 6px' : '0',
                  borderRadius: 3,
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: 12, backgroundColor: '#06b6d4', padding: '2px 6px', borderRadius: 3 }}>
                💰 0
              </span>
            </div>

            {/* Expense lines */}
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {transactions.filter(t => t.payerId === person.id).map(t => (
                <div key={t.id} style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                    <input
                      type="text"
                      placeholder="What?"
                      value={t.title}
                      onChange={e => updateTransaction(t.id, { title: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        border: `1px solid ${borderColor}`,
                        borderRadius: 4,
                        backgroundColor: cardBg,
                        color: textColor,
                        fontSize: 13,
                      }}
                    />
                    <input
                      type="number"
                      placeholder="How much"
                      value={t.amount}
                      onChange={e => updateTransaction(t.id, { amount: e.target.value })}
                      style={{
                        width: 100,
                        padding: '8px 10px',
                        border: `1px solid ${borderColor}`,
                        borderRadius: 4,
                        backgroundColor: cardBg,
                        color: textColor,
                        fontSize: 13,
                      }}
                    />
                    <button
                      onClick={() => removeTransaction(t.id)}
                      style={{
                        width: 32,
                        height: 32,
                        border: '1px solid #dc2626',
                        backgroundColor: 'transparent',
                        color: '#dc2626',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      −
                    </button>
                    <button
                      onClick={() => toggleParticipantList(t.id)}
                      style={{
                        width: 32,
                        height: 32,
                        backgroundColor: '#0891b2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
                    >
                      👥
                    </button>
                  </div>

                  {/* Participants Popup - Scrollable */}
                  {t.showParticipants && (
                    <>
                      {/* Overlay to close popup */}
                      <div
                        onClick={() => toggleParticipantList(t.id)}
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: 9,
                        }}
                      />
                      {/* Popup content */}
                      <div style={{
                        position: 'fixed',
                        backgroundColor: cardBg,
                        border: `2px solid #0891b2`,
                        borderRadius: 6,
                        padding: 12,
                        width: 240,
                        maxHeight: 300,
                        overflowY: 'auto',
                        zIndex: 10,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14, color: textColor, textAlign: 'center' }}>
                          Who shares this expense?
                        </div>
                        {people.map(pp => {
                          const isChecked = (t.participants || []).includes(pp.id);
                          return (
                            <div
                              key={pp.id}
                              style={{
                                display: 'flex',
                                gap: 10,
                                alignItems: 'center',
                                marginBottom: 10,
                                padding: '10px 12px',
                                borderRadius: 4,
                                backgroundColor: isChecked ? '#e0f2fe' : 'transparent',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                              }}
                              onClick={() => toggleParticipantForTransaction(t.id, pp.id)}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                style={{
                                  cursor: 'pointer',
                                  width: 18,
                                  height: 18,
                                  accentColor: '#0891b2',
                                  pointerEvents: 'none',
                                }}
                              />
                              <span style={{ color: isChecked ? '#0891b2' : mutedColor, fontWeight: isChecked ? 600 : 400, fontSize: 14 }}>
                                {pp.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {validationErrors[t.id] && (
                    <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
                      {validationErrors[t.id]}
                    </div>
                  )}
                </div>
              ))}

              {/* More button */}
              <button
                onClick={() => addTransactionForPayer(person.id)}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  color: '#0891b2',
                  border: `1px dashed ${borderColor}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                + more
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Right column: Main content + Calculate button */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Main content area */}
        <div style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 6,
          padding: 24,
        }}>
          <h2 style={{ color: textColor, fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
            Who paid what?
          </h2>
          <p style={{ color: mutedColor, lineHeight: 1.6, fontSize: 14 }}>
            Enter the names and how much everyone spent for the group. Add more expenses with the +, remove them with the −. Expenses not shared by everyone can be edited with the 👥 button.
          </p>
          {validationErrors._global && (
            <div style={{ color: '#dc2626', marginTop: 16, fontSize: 13 }}>
              {validationErrors._global}
            </div>
          )}
        </div>

        {/* Calculate & Save button */}
        {anyPaymentEntered && (
          <button
            onClick={handleCalculateAndSave}
            disabled={saving}
            style={{
              padding: '16px 24px',
              fontSize: 18,
              fontWeight: 700,
              backgroundColor: '#0891b2',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Calculate & Save!'}
          </button>
        )}

        {/* Settlement summary */}
        <div style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 6,
          padding: 20,
          flex: 1,
        }}>
          <SettlementSummary groupId={group.id} people={people} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}
