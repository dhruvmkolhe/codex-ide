import React from 'react';

export default function NeoIdeEditor() {
  return (
    <div style={{ padding: '20px', color: '#fff', background: '#000', height: '100vh' }}>
      <h1>Neo UI Layout</h1>
      <p>This is a placeholder for the Neo UI. You can build your custom frontend here.</p>
      <button onClick={() => (window.location.href = '/ide')}>Back to Classic UI</button>
    </div>
  );
}
