
  const handleConnectSubmit = async e => {
    e.preventDefault();
    if (!connectEmail.trim() || !connectName.trim()) {
      setSendError('Please fill in all required fields.');
      return;
    }
    if (!userData?.email) {
      setSendError('Profile owner has no email address configured.');
      return;
    }
    setIsSending(true);
    setSendError('');
    
    try {
      const response = await fetch('/.netlify/functions/sendMail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitorEmail: connectEmail,
          visitorName: connectName,
          visitorCompany: connectCompany,
          visitorPhone: connectPhone,
          visitorMessage: message,
          ownerEmail: userData.email,
          ownerName: userData.displayName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSending(false);
        setSendSuccess(true);
        setTimeout(() => {
          setSendSuccess(false);
          setShowConnectForm(false);
          setConnectEmail('');
          setConnectName('');
          setConnectCompany('');
          setConnectPhone('');
          setMessage('');
        }, 3000);
      } else {
        throw new Error(data.error || 'Failed to send');
      }
    } catch (err) {
      setIsSending(false);
      setSendError('Failed to send. Please try again.');
      console.error('Email error:', err);
    }
  };