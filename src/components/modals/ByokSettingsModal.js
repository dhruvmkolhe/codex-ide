import React, { useState, useEffect } from 'react';
import {
  getProviders,
  setProviderKey,
  toggleProviderEnabled,
  addCustomProvider,
  deleteCustomProvider,
  testProviderConnection,
} from '../../utils/byokProviderService';
import './ByokSettingsModal.css';

export default function ByokSettingsModal({ isOpen, onClose, onShowToast }) {
  const [providers, setProviders] = useState([]);
  const [showKeys, setShowKeys] = useState({});
  const [testingStatus, setTestingStatus] = useState({});
  const [testResults, setTestResults] = useState({});
  const [activeTab, setActiveTab] = useState('default');

  // New Custom Provider Form State
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState('ai');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [customHeader, setCustomHeader] = useState('Authorization');
  const [customApiKey, setCustomApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProviders(getProviders());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyChange = (providerId, val) => {
    const updated = setProviderKey(providerId, val);
    setProviders(updated);
  };

  const handleToggleEnable = (providerId, currentEnabled) => {
    const updated = toggleProviderEnabled(providerId, !currentEnabled);
    setProviders(updated);
    if (onShowToast) {
      onShowToast(`Provider '${providerId}' ${!currentEnabled ? 'enabled' : 'disabled'}`, 'info');
    }
  };

  const toggleShowKey = (providerId) => {
    setShowKeys((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const handleTestConnection = async (providerId) => {
    setTestingStatus((prev) => ({ ...prev, [providerId]: true }));
    setTestResults((prev) => ({ ...prev, [providerId]: null }));

    const res = await testProviderConnection(providerId);

    setTestingStatus((prev) => ({ ...prev, [providerId]: false }));
    setTestResults((prev) => ({ ...prev, [providerId]: res }));

    if (onShowToast) {
      onShowToast(res.message, res.success ? 'success' : 'error');
    }
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customName.trim() || !customEndpoint.trim()) {
      if (onShowToast) onShowToast('Please provide a provider name and endpoint URL', 'error');
      return;
    }

    const updated = addCustomProvider({
      name: customName,
      type: customType,
      endpoint: customEndpoint,
      headerName: customHeader,
      apiKey: customApiKey,
    });

    setProviders(updated);
    setCustomName('');
    setCustomEndpoint('');
    setCustomApiKey('');

    if (onShowToast) onShowToast('Custom API Provider added successfully!', 'success');
  };

  const handleDeleteCustom = (providerId) => {
    const updated = deleteCustomProvider(providerId);
    setProviders(updated);
    if (onShowToast) onShowToast('Custom Provider deleted', 'info');
  };

  const defaultList = providers.filter((p) => !p.isCustom);
  const customList = providers.filter((p) => p.isCustom);

  return (
    <div className="byok-modal-overlay" onClick={onClose}>
      <div className="byok-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="byok-modal-header">
          <div className="byok-modal-title">
            <span className="byok-title-icon">🔑</span>
            <div>
              <h3>Bring Your Own Key (BYOK) & Provider Settings</h3>
              <p>
                Configure custom API keys. All keys stay 100% client-side in secure local storage.
              </p>
            </div>
          </div>
          <button className="byok-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="byok-tabs">
          <button
            className={`byok-tab ${activeTab === 'default' ? 'active' : ''}`}
            onClick={() => setActiveTab('default')}
          >
            Out-of-the-Box Providers ({defaultList.length})
          </button>
          <button
            className={`byok-tab ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            Custom User Providers ({customList.length})
          </button>
        </div>

        <div className="byok-modal-body">
          {activeTab === 'default' && (
            <div className="byok-providers-list">
              {defaultList.map((p) => (
                <div key={p.id} className={`byok-card ${!p.enabled ? 'disabled' : ''}`}>
                  <div className="byok-card-header">
                    <div className="byok-provider-info">
                      <span className="byok-type-badge">{p.type.toUpperCase()}</span>
                      <strong className="byok-provider-name">{p.name}</strong>
                    </div>
                    <label className="byok-switch" title="Enable or Disable Provider">
                      <input
                        type="checkbox"
                        checked={p.enabled}
                        onChange={() => handleToggleEnable(p.id, p.enabled)}
                      />
                      <span className="byok-slider round"></span>
                    </label>
                  </div>

                  <p className="byok-description">{p.description}</p>

                  <div className="byok-input-group">
                    <div className="byok-input-wrapper">
                      <input
                        type={showKeys[p.id] ? 'text' : 'password'}
                        placeholder={p.apiKey ? '••••••••••••••••' : `Enter your ${p.name} API Key`}
                        value={p.apiKey}
                        onChange={(e) => handleKeyChange(p.id, e.target.value)}
                        disabled={!p.enabled}
                      />
                      <button
                        type="button"
                        className="byok-toggle-show"
                        onClick={() => toggleShowKey(p.id)}
                        title={showKeys[p.id] ? 'Hide Key' : 'Show Key'}
                      >
                        {showKeys[p.id] ? '🙈' : '👁️'}
                      </button>
                    </div>

                    <button
                      type="button"
                      className="byok-test-btn"
                      onClick={() => handleTestConnection(p.id)}
                      disabled={!p.enabled || testingStatus[p.id]}
                    >
                      {testingStatus[p.id] ? 'Testing...' : '⚡ Test Connection'}
                    </button>
                  </div>

                  {testResults[p.id] && (
                    <div
                      className={`byok-test-result ${
                        testResults[p.id].success ? 'success' : 'error'
                      }`}
                    >
                      {testResults[p.id].success ? '✅ ' : '❌ '}
                      {testResults[p.id].message}
                    </div>
                  )}

                  {p.docsUrl && (
                    <a
                      href={p.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="byok-get-key-link"
                    >
                      🔗 Get {p.name} API Key
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="byok-custom-section">
              <form className="byok-custom-form" onSubmit={handleAddCustom}>
                <h4>Add Custom Third-Party API Provider</h4>
                <div className="byok-form-grid">
                  <div className="byok-form-field">
                    <label>Provider Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Local Ollama or Custom Proxy"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="byok-form-field">
                    <label>Provider Type</label>
                    <select value={customType} onChange={(e) => setCustomType(e.target.value)}>
                      <option value="ai">AI Model Access</option>
                      <option value="execution">Code Execution</option>
                    </select>
                  </div>
                  <div className="byok-form-field full-width">
                    <label>API Endpoint URL *</label>
                    <input
                      type="url"
                      placeholder="https://my-custom-proxy.com/v1"
                      value={customEndpoint}
                      onChange={(e) => setCustomEndpoint(e.target.value)}
                      required
                    />
                  </div>
                  <div className="byok-form-field">
                    <label>Header Name</label>
                    <input
                      type="text"
                      placeholder="Authorization"
                      value={customHeader}
                      onChange={(e) => setCustomHeader(e.target.value)}
                    />
                  </div>
                  <div className="byok-form-field">
                    <label>API Key</label>
                    <input
                      type="password"
                      placeholder="Enter API Key"
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="byok-add-btn">
                  ➕ Add Custom Provider
                </button>
              </form>

              <div className="byok-custom-list">
                <h4>Your Custom Providers ({customList.length})</h4>
                {customList.length === 0 ? (
                  <p className="byok-empty-state">No custom providers added yet.</p>
                ) : (
                  customList.map((p) => (
                    <div key={p.id} className="byok-card custom">
                      <div className="byok-card-header">
                        <div>
                          <strong className="byok-provider-name">{p.name}</strong>
                          <span className="byok-endpoint-text">{p.endpoint}</span>
                        </div>
                        <button
                          type="button"
                          className="byok-delete-btn"
                          onClick={() => handleDeleteCustom(p.id)}
                          title="Delete Custom Provider"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="byok-modal-footer">
          <button className="byok-done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
