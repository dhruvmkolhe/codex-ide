import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { auditLog } from '../utils/auditLogger';

export function useMfa({ user, showToast }) {
  const [mfaData, setMfaData] = useState(null); // { id, qrCode, secret }
  const [mfaLoading, setMfaLoading] = useState(false);
  const [isMfaEnrolled, setIsMfaEnrolled] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.auth.mfa.listFactors().then(({ data }) => {
        if (data && data.totp && data.totp.length > 0) {
          setIsMfaEnrolled(data.totp[0].status === 'verified');
        } else {
          setIsMfaEnrolled(false);
        }
      });
    } else {
      setIsMfaEnrolled(false);
      setMfaData(null);
    }
  }, [user]);

  const handleMfaEnroll = async () => {
    if (!supabase || !user) return;
    setMfaLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) {
        showToast(error.message, 'error');
      } else {
        setMfaData({
          id: data.id,
          qrCode: data.totp.qr_code,
          secret: data.totp.secret,
        });
        showToast('MFA enrollment initiated. Scan the QR code.', 'success');
      }
    } catch (err) {
      console.error('MFA enroll error:', err);
    } finally {
      setMfaLoading(false);
    }
  };

  const handleMfaVerify = async (code) => {
    if (!supabase || !mfaData) return;
    setMfaLoading(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaData.id,
        code,
      });
      if (error) {
        showToast(error.message, 'error');
      } else {
        setIsMfaEnrolled(true);
        setMfaData(null);
        auditLog('mfa_enabled', user.id, {});
        showToast('MFA successfully enabled!', 'success');
      }
    } catch (err) {
      console.error('MFA verify error:', err);
    } finally {
      setMfaLoading(false);
    }
  };

  const handleMfaUnenroll = async () => {
    if (!supabase || !user) return;
    setMfaLoading(true);
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors?.totp?.[0]) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: factors.totp[0].id });
        if (error) {
          showToast(error.message, 'error');
        } else {
          setIsMfaEnrolled(false);
          auditLog('mfa_disabled', user.id, {});
          showToast('MFA has been disabled.', 'success');
        }
      }
    } catch (err) {
      console.error('MFA unenroll error:', err);
    } finally {
      setMfaLoading(false);
    }
  };

  return {
    mfaData,
    setMfaData,
    mfaLoading,
    isMfaEnrolled,
    handleMfaEnroll,
    handleMfaVerify,
    handleMfaUnenroll,
  };
}
