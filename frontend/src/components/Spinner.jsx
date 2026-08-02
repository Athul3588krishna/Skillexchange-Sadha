import React from 'react';

const Spinner = ({ size = 40, text = 'Loading...', fullPage = false }) => {
  const spinnerEl = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `3px solid rgba(79, 70, 229, 0.15)`,
          borderTopColor: 'var(--primary)',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      {text && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{text}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {spinnerEl}
      </div>
    );
  }

  return spinnerEl;
};

export default Spinner;
