// src/components/SettlementSummary.jsx
import React, { useEffect, useState } from 'react';
import { settleDebug, settle } from '../api';

export default function SettlementSummary({ groupId, people, darkMode }) {
  const [debug, setDebug] = useState(null);
  const [txns, setTxns] = useState([]);

  const textColor = darkMode ? '#e0e0e0' : '#000';
  const borderColor = darkMode ? '#444' : '#eee';
  const mutedColor = darkMode ? '#999' : '#555';

  useEffect(() => {
    if (!groupId) return;
    refresh();
  }, [groupId]);

  async function refresh() {
    try {
      const d = await settleDebug(groupId);
      setDebug(d);
      setTxns(d.transactions || []);
    } catch (err) {
      setDebug(null);
      setTxns([]);
    }
  }

  async function finalize() {
    try {
      const t = await settle(groupId);
      setTxns(t);
      alert('Settlement computed — check the list!');
    } catch (err) {
      alert('Failed to finalize: ' + err?.message);
    }
  }

  return (
    <div>
      <h3 style={{ color: textColor }}>Settlement</h3>
      <div style={{ marginBottom: 8 }}>
        <button
          onClick={refresh}
          style={{
            marginRight: 6,
            padding: '6px 12px',
            backgroundColor: '#0891b2',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Refresh
        </button>
        <button
          onClick={finalize}
          style={{
            padding: '6px 12px',
            backgroundColor: '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Finalize
        </button>
      </div>

      {!debug && <div style={{ color: mutedColor }}>No data</div>}

      {debug && (
        <>
          <div style={{ fontSize: 13, marginBottom: 8, color: textColor }}>
            <strong>Balances</strong>
            <ul style={{ color: textColor }}>
              {debug.people.map(p => (
                <li key={p.personId} style={{ color: textColor }}>
                  {p.name}: paid ₹{Number(p.paid).toFixed(2)}, owed ₹{Number(p.owed).toFixed(2)}, balance ₹{Number(p.balance).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ color: textColor }}>
            <strong>Transactions</strong>
            {txns.length === 0 && <div style={{ color: mutedColor }}>No transactions needed</div>}
            {txns.map((t, i) => (
              <div key={i} style={{
                padding: 8,
                border: `1px solid ${borderColor}`,
                marginTop: 6,
                borderRadius: 4,
                backgroundColor: darkMode ? '#333' : '#f9f9f9',
              }}>
                <div style={{ color: textColor }}>{t.fromName} → {t.toName}</div>
                <div style={{ color: textColor }}><strong>₹{Number(t.amount).toFixed(2)}</strong></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
