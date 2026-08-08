import React from 'react';
import { LightningIcon, WarningIcon, BellIcon } from '../Icons';
import { getLanguageFooterLabel } from '../../utils/languageUtils';

export function IdeFooter({
  isRunning,
  errorAnalysis,
  jumpToErrorLine,
  handleToggleTabSize,
  tabSize,
  selectedLanguage,
}) {
  return (
    <div className="ide-footer">
      <div className="footer-left">
        <span className="footer-item footer-status">
          {isRunning ? <span className="btn-spinner footer-spinner" /> : <LightningIcon />}
          <span>{isRunning ? 'Running...' : 'Ready'}</span>
        </span>
        <span
          className={`footer-item footer-diagnostics ${errorAnalysis ? 'has-error' : ''}`}
          onClick={() => {
            if (errorAnalysis && errorAnalysis.line) {
              jumpToErrorLine(errorAnalysis.line);
            }
          }}
          style={{ cursor: errorAnalysis ? 'pointer' : 'default' }}
        >
          <WarningIcon />
          <span>{errorAnalysis ? '1 Error' : 'No Errors'}</span>
        </span>
      </div>
      <div className="footer-right">
        <span
          className="footer-item footer-indent"
          onClick={handleToggleTabSize}
          style={{ cursor: 'pointer' }}
          title="Click to toggle indentation spaces (2, 4, 8)"
        >
          Spaces: {tabSize}
        </span>
        <span className="footer-item footer-encoding">UTF-8</span>
        <span className="footer-item footer-lang">{getLanguageFooterLabel(selectedLanguage)}</span>
        <span className="footer-item footer-bell" title="Notifications">
          <BellIcon />
        </span>
      </div>
    </div>
  );
}
