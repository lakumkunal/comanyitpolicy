import React, { useState } from 'react';
import styles from './AddPolicy.module.css'; 
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import log from '../log.js';

function AddPolicy() {
  const [policyname, setPolicyname] = useState('');
  const [sessiontimeout, setSessiontimeout] = useState('');
  const [passwordattempts, setPasswordattempts] = useState('');
  const [passwordneverexpires, setPasswordneverexpires] = useState(false);
  const [passwordchangeduration, setPasswordchangeduration] = useState('');
  const [passwordexpirenotification, setPasswordexpirenotification] = useState('');
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const navigate = useNavigate();

  const handleReset = () => {
    setPolicyname('');
    setSessiontimeout('');
    setPasswordattempts('');
    setPasswordneverexpires(false);
    setPasswordchangeduration('');
    setPasswordexpirenotification('');
    setStatus('');
    setErrors({});
    setIsSubmitted(false);
  };

  const validatePolicyName = (name) => {
    if (!/^[a-zA-Z0-9]/.test(name) || !/[a-zA-Z0-9]$/.test(name)) {
      return 'Policy name must start and end with an alphanumeric character.';
    } else if (!/^[a-zA-Z0-9 _-]*$/.test(name)) {
      return 'Policy name can only contain alphanumeric characters, underscores, spaces, and dashes (-).';  
    } else if (/__+/.test(name)) {
      return 'Policy name cannot contain consecutive underscores.';
    } else if (/([a-zA-Z0-9])\1\1/.test(name)) {
      return 'Policy name cannot contain three consecutive identical characters.';
    }
    return '';
  };

  const validateSessionTimeout = (timeout) => {
    if (isNaN(timeout) || timeout < 1 || timeout > 999) {
      return 'Session Timeout must be a number between 1 and 999.';
    }
    return '';
  };

  const validatePasswordAttempts = (attempts) => {
    if (isNaN(attempts) || attempts < 1 || attempts > 999) {
      return 'Password Attempts must be a number between 1 and 999.';
    }
    return '';
  };

  const validatePasswordChangeDuration = (duration) => {
    if (isNaN(duration) || duration < 1 || duration > 999) {
      return 'Password Change Duration must be a number between 1 and 999.';
    } else if (parseInt(passwordexpirenotification) && parseInt(duration) < parseInt(passwordexpirenotification)) {
      return 'Password Change Duration cannot be less than Password Expire Notification.';
    }
    return '';
  };

  const validatePasswordExpireNotification = (notification) => {
    if (isNaN(notification) || notification < 1 || notification > 999) {
      return 'Password Expire Notification must be a number between 1 and 999.';
    } else if (parseInt(passwordchangeduration) && parseInt(notification) > parseInt(passwordchangeduration)) {
      return 'Password Expire Notification cannot be greater than Password Change Duration.';
    }
    return '';
  };

  const handlePolicyNameChange = (e) => {
    const name = e.target.value;
    setPolicyname(name);
    setErrors(prevErrors => ({ ...prevErrors, policyname: validatePolicyName(name) }));
  };

  const handleSessionTimeoutChange = (e) => {
    const timeout = e.target.value;
    setSessiontimeout(timeout.replace(/[^0-9]/g, '')); 
    setErrors(prevErrors => ({ ...prevErrors, sessiontimeout: validateSessionTimeout(timeout) }));
  };

  const handlePasswordAttemptsChange = (e) => {
    const attempts = e.target.value;
    setPasswordattempts(attempts.replace(/[^0-9]/g, '')); 
    setErrors(prevErrors => ({ ...prevErrors, passwordattempts: validatePasswordAttempts(attempts) }));
  };
  
  const handlePasswordChangeDurationChange = (e) => {
    const duration = e.target.value;
    setPasswordchangeduration(duration.replace(/[^0-9]/g, '')); 
    setErrors(prevErrors => ({ ...prevErrors, passwordchangeduration: validatePasswordChangeDuration(duration) }));
  };

  const handlePasswordExpireNotificationChange = (e) => {
    const notification = e.target.value;
    setPasswordexpirenotification(notification.replace(/[^0-9]/g, ''));
    setErrors(prevErrors => ({ ...prevErrors, passwordexpirenotification: validatePasswordExpireNotification(notification) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    const newErrors = {};
    newErrors.policyname = validatePolicyName(policyname);
    newErrors.sessiontimeout = validateSessionTimeout(sessiontimeout);
    newErrors.passwordattempts = validatePasswordAttempts(passwordattempts);
    if (!passwordneverexpires) {
      newErrors.passwordchangeduration = validatePasswordChangeDuration(passwordchangeduration);
      newErrors.passwordexpirenotification = validatePasswordExpireNotification(passwordexpirenotification);
    }

    if (Object.values(newErrors).some(error => error)) {
      setErrors(newErrors);
      return;
    }

    const formData = {
      policyname,
      sessiontimeout,
      passwordattempts,
      passwordneverexpires,
      passwordchangeduration: passwordneverexpires ? null : passwordchangeduration,
      passwordexpirenotification: passwordneverexpires ? null : passwordexpirenotification,
      status
    };

  try {
    const response = await fetch('http://localhost:5000/api/postcompanyitpolicy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });
    
    if (response.ok) {
        const result = await response.json();
        console.log('Form submitted successfully:', result);
        
        handleReset();
        toast.success(`Policy ${formData.policyname} saved successfully!`);
        
        console.log('Calling log function with success details');
        log('POST /api/postcompanyitpolicy', 'Success', 200, `Policy ${formData.policyname} saved successfully`);
        
        setIsSubmitted(false);
    } else {
        console.error('Error submitting form:', response.statusText);
        
        toast.error('Error submitting form. Please try again.');
        log('POST /api/postcompanyitpolicy', 'Error', response.status, `Failed to submit form: ${response.statusText}`);
    }
  
    
} catch (error) {
    log('POST /api/postcompanyitpolicy', 'Error', 500, `An exception occurred: ${error.message}`);
    
    console.error('An error occurred:', error);
    toast.error('An error occurred. Please check the console for details.');
}
  }

  const handleRedirect = () => {
    navigate('/GetPolicy');
  };

  return (
    <form className={styles.formContainer} id="addPolicyForm">
    <h1>Company IT Policy Master</h1>
    <div className={`${styles.formGroup} ${styles.sideBySide}`}>
      <div>
        <label>
          Policy Name: 
          {isSubmitted && !policyname && <span className={styles.requiredAsterisk}>*</span>}
        </label>
        <input
          type="text"
          value={policyname}
          onChange={handlePolicyNameChange}
        />
        {isSubmitted && !policyname ? null : errors.policyname && <p className={styles.error}>{errors.policyname}</p>}
      </div>
      <div>
        <label>
          Session Timeout (minutes): 
          {isSubmitted && !sessiontimeout && <span className={styles.requiredAsterisk}>*</span>}
        </label>
        <input
          type="text"
          value={sessiontimeout}
          onChange={handleSessionTimeoutChange}
        />
        {isSubmitted && !sessiontimeout ? null : errors.sessiontimeout && <p className={styles.error}>{errors.sessiontimeout}</p>}
      </div>
    </div>
    <div className={`${styles.formGroup} ${styles.sideBySide}`}>
      <div>
        <label>
          Password Attempts: 
          {isSubmitted && !passwordattempts && <span className={styles.requiredAsterisk}>*</span>}
        </label>
        <input
          type="text"
          value={passwordattempts}
          onChange={handlePasswordAttemptsChange}
        />
        {isSubmitted && !passwordattempts ? null : errors.passwordattempts && <p className={styles.error}>{errors.passwordattempts}</p>}
      </div>
      <div>
        <label>
          Password Never Expires: 
          {isSubmitted && !policyname && <span className={styles.requiredAsterisk}>*</span>}
        </label>
        <input
          type="checkbox"
          checked={passwordneverexpires}
          onChange={(e) => setPasswordneverexpires(e.target.checked)}
        />
      </div>
    </div>
    {!passwordneverexpires && (
      <div>
        <div className={styles.formGroup}>
          <label>
            Password Change Duration: 
            {isSubmitted && !passwordchangeduration && <span className={styles.requiredAsterisk}>*</span>}
          </label>
          <input
            type="text"
            value={passwordchangeduration}
            onChange={handlePasswordChangeDurationChange}
          />
          {isSubmitted && !passwordchangeduration ? null : errors.passwordchangeduration && <p className={styles.error}>{errors.passwordchangeduration}</p>}
        </div>
        <div className={styles.formGroup}>
          <label>
            Password Expire Notification: 
            {isSubmitted && !passwordexpirenotification && <span className={styles.requiredAsterisk}>*</span>}
          </label>
          <input
            type="text"
            value={passwordexpirenotification}
            onChange={handlePasswordExpireNotificationChange}
          />
          {isSubmitted && !passwordexpirenotification ? null : errors.passwordexpirenotification && <p className={styles.error}>{errors.passwordexpirenotification}</p>}
        </div>
      </div>
    )}
    <div className={styles.formGroup}>
      <label>
        Status: 
        {isSubmitted && !status && <span className={styles.requiredAsterisk}>*</span>}
      </label>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">Select</option>
        <option value="1">Active</option>
        <option value="2">Inactive</option>
      </select>
    </div>
    <button type="submit" onClick={handleSubmit} className={styles.submitButton}>Submit</button>
    <button type="button" onClick={handleReset} className={styles.ResetButton}>Reset</button>
    <button type="button" onClick={handleRedirect} className={styles.ListButton}>List</button>
  </form>
  
  );
}

export default AddPolicy;
