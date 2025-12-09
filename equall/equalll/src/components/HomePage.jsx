import React, { useState } from 'react';

export default function HomePage({ onStart, onShowExample, darkMode }) {
  const [numPeople, setNumPeople] = useState(3);
  const [groupName, setGroupName] = useState('');

  const bgColor = darkMode ? '#1e1e1e' : '#fff';
  const textColor = darkMode ? '#e0e0e0' : '#000';
  const mutedColor = darkMode ? '#999' : '#666';
  const borderColor = darkMode ? '#333' : '#ddd';

  return (
    <div style={{ backgroundColor: bgColor, color: textColor, minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{
        backgroundColor: darkMode ? '#0a0a0a' : '#f8f9fa',
        padding: '60px 20px',
        textAlign: 'center',
        borderBottom: `1px solid ${borderColor}`,
      }}>
        <h1 style={{
          fontSize: 64,
          fontWeight: 700,
          margin: '0 0 20px 0',
          color: '#0891b2',
        }}>
          EquaLL
        </h1>
        <p style={{
          fontSize: 20,
          fontWeight: 500,
          color: '#0891b2',
          margin: '10px 0',
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Split bills for shared group expenses.
        </p>
        <p style={{
          fontSize: 20,
          fontWeight: 500,
          color: '#0891b2',
          margin: '10px 0',
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          We tell you who owes whom and how to settle debts in groups.
        </p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '60px 20px' }}>
        {/* Show example button */}
        <button
          onClick={onShowExample}
          style={{
            width: '100%',
            padding: '16px',
            marginBottom: 20,
            fontSize: 16,
            fontWeight: 600,
            border: 'none',
            borderRadius: 4,
            backgroundColor: '#0891b2',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <span>ℹ️</span> Show example
        </button>

        <div style={{ textAlign: 'center', marginBottom: 30, color: mutedColor }}>
          or
        </div>

        {/* New calculation section */}
        <div style={{
          border: `2px solid #0891b2`,
          borderRadius: 4,
          overflow: 'hidden',
          backgroundColor: darkMode ? '#2a2a2a' : '#f0f4f8',
        }}>
          <div style={{
            backgroundColor: '#0891b2',
            color: '#fff',
            padding: '12px 16px',
            fontSize: 16,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span>📋</span> Start new calculation
          </div>

          <div style={{ padding: '32px 24px' }}>
            {/* People count section */}
            <div style={{ marginBottom: 40 }}>
              <h3 style={{
                fontSize: 18,
                fontWeight: 500,
                marginBottom: 20,
                textAlign: 'center',
                color: textColor,
              }}>
                How many people are in your group?
              </h3>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
              }}>
                <button
                  onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                  style={{
                    width: 48,
                    height: 48,
                    fontSize: 24,
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: 4,
                    backgroundColor: '#0891b2',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  −
                </button>

                <div style={{
                  width: 80,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  fontWeight: 600,
                  color: '#0891b2',
                  border: `2px solid #0891b2`,
                  borderRadius: 4,
                  backgroundColor: bgColor,
                }}>
                  {numPeople}
                </div>

                <button
                  onClick={() => setNumPeople(numPeople + 1)}
                  style={{
                    width: 48,
                    height: 48,
                    fontSize: 24,
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: 4,
                    backgroundColor: '#0891b2',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
              </div>

              <p style={{
                fontSize: 12,
                color: mutedColor,
                textAlign: 'center',
                marginTop: 12,
                margin: '12px 0 0 0',
              }}>
                People can be excluded from single expenses later
              </p>
            </div>

            {/* Group name section */}
            <div>
              <h3 style={{
                fontSize: 18,
                fontWeight: 500,
                marginBottom: 16,
                textAlign: 'center',
                color: textColor,
              }}>
                Give it a name!
              </h3>

              <input
                type="text"
                placeholder="e.g. Roadtrip"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: 16,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 4,
                  boxSizing: 'border-box',
                  marginBottom: 24,
                  backgroundColor: darkMode ? '#333' : '#fff',
                  color: textColor,
                }}
              />

              <button
                onClick={() => onStart(numPeople, groupName)}
                disabled={!groupName.trim()}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: 20,
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: 4,
                  backgroundColor: groupName.trim() ? '#22c55e' : '#ccc',
                  color: '#fff',
                  cursor: groupName.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Go!
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* What you get section */}
      <div style={{
        padding: '80px 20px',
        backgroundColor: darkMode ? '#0a0a0a' : '#f8f9fa',
        borderTop: `1px solid ${borderColor}`,
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: 32,
          fontWeight: 700,
          color: '#0891b2',
          marginBottom: 60,
        }}>
          What you get
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 60,
          maxWidth: 900,
          margin: '0 auto',
          alignItems: 'center',
        }}>
          <div>
            <div style={{
              fontSize: 80,
              marginBottom: 20,
            }}>
              💻
            </div>
            <p style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: mutedColor,
              textAlign: 'left',
            }}>
              Very often on holiday, at partys, for presents or in free-time everyone pays something for a group of people. Calculating the payments afterwards to even out the group can be a daunting and complicated task (even with a calculator) - especially when some expenses are not shared with all group members.
            </p>
            <p style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: mutedColor,
              marginTop: 20,
              textAlign: 'left',
            }}>
              EquaLL helps you with that: After you entered everyone's name and the spendings she or he had for the group, the calculator tells you who owes whom how much and how to settle debts in the group.
            </p>
            <p style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: mutedColor,
              marginTop: 20,
              textAlign: 'left',
            }}>
              It is also possible for expenses not be shared with the whole group and only among specific people.
            </p>
          </div>

          <div style={{
            fontSize: 60,
          }}>
            📊
          </div>
        </div>
      </div>

      {/* Good to know section */}
      <div style={{
        padding: '80px 20px',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <h2 style={{
          fontSize: 32,
          fontWeight: 700,
          color: '#0891b2',
          marginBottom: 60,
          textAlign: 'center',
        }}>
          Good to know...
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 40,
          textAlign: 'center',
        }}>
          <div>
            <div style={{ fontSize: 60, marginBottom: 20 }}>🎁</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: textColor, marginBottom: 10 }}>It's free.</h3>
            <p style={{ color: mutedColor }}>It's easy.</p>
          </div>

          <div>
            <div style={{ fontSize: 60, marginBottom: 20 }}>✅</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: textColor, marginBottom: 10 }}>No Sign-up.</h3>
            <p style={{ color: mutedColor }}>No download.</p>
          </div>

          <div>
            <div style={{ fontSize: 60, marginBottom: 20 }}>🎨</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: textColor, marginBottom: 10 }}>Share the result.</h3>
            <p style={{ color: mutedColor }}>Edit later.</p>
          </div>
        </div>
      </div>

      {/* Why this site section */}
      <div style={{
        padding: '80px 20px',
        backgroundColor: darkMode ? '#0a0a0a' : '#f8f9fa',
        borderTop: `1px solid ${borderColor}`,
      }}>
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#0891b2',
            marginBottom: 40,
          }}>
            Why this site?
          </h2>

          <p style={{
            fontSize: 16,
            lineHeight: 1.8,
            color: mutedColor,
            marginBottom: 30,
          }}>
            Calculating the right amounts of money and the transactions (who pays to whom how much) to clear a group's shared costs and to settle debts for payback can be tedious task - often only solved with the help of spreadsheets. It even becomes more complicated when one or more community spendings are not shared by the whole group (e.g. one friend did not want to join the group for the museum trip paid by another friend for everyone).
          </p>

          <p style={{
            fontSize: 16,
            lineHeight: 1.8,
            color: mutedColor,
            marginBottom: 30,
          }}>
            We therefore established EquaLL to provide people with an easy, free, fast and reliable way to split up their group expenses after holidays, parties, shared presents, festivals, vacations, trips, weddings, roadtrips or in clubs and shared apartments and so much more.
          </p>

          <p style={{
            fontSize: 16,
            lineHeight: 1.8,
            color: mutedColor,
            marginBottom: 40,
          }}>
            Everything happens in the browser without the need for signup or the installation of an App on mobile phones. It is our mission to save groups in which everyone paid some bills from arguments and wasting time after the fun is over.
          </p>

          <button
            onClick={onStart}
            style={{
              padding: '16px 32px',
              fontSize: 18,
              fontWeight: 700,
              border: 'none',
              borderRadius: 4,
              backgroundColor: '#0891b2',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Click to start!
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: mutedColor,
        fontSize: 12,
        borderTop: `1px solid ${borderColor}`,
      }}>
        <p style={{ margin: 0 }}>About · Terms of Use & Privacy Policy · Imprint</p>
        <p style={{ margin: '10px 0 0 0' }}>We use cookies to ensure the best service. If you continue to use the site, you accept our cookie-policy.</p>
      </div>
    </div>
  );
}
