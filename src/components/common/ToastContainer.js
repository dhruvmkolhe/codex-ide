import React from 'react';
import { ToastSuccessIcon, ToastInfoIcon, ToastErrorIcon } from '../Icons';

export function ToastContainer({ toasts }) {
  return (
    <div className="toasts-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' && <ToastSuccessIcon />}
            {toast.type === 'info' && <ToastInfoIcon />}
            {toast.type === 'error' && <ToastErrorIcon />}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
