import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './AddPolicy.module.css';
import { toast } from 'react-toastify';
import log from '../log';

const EditPolicy = () => {
  const { id } = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    policyname: '',
    sessiontimeout: '',
    passwordattempts: '',
    passwordneverexpires: false,
    passwordchangeduration: '',
    passwordexpirenotification: '',
    status: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolicyById = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/getcompanyitpolicy/${id}`);
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setPolicy(data);
            setFormData({
              policyname: data.policyname,
              sessiontimeout: data.sessiontimeout,
              passwordattempts: data.passwordattempts,
              passwordneverexpires: data.passwordneverexpires,
              passwordchangeduration: data.passwordchangeduration,
              passwordexpirenotification: data.passwordexpirenotification,
              status: data.status,
            });
            setLoading(false);
          } else {

            navigate('/GetPolicy');
          }
        } else {
          navigate('/GetPolicy');
        }
      } catch (error) {
        toast.error('Error fetching policy:', error);
        navigate('/GetPolicy');
      }
    };

    fetchPolicyById();
  }, [id, navigate]);

  const validateFormData = (data) => {
    const errors = {};
  
    
    const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';
  
    
    if (isNonEmptyString(data.sessiontimeout)) {
      const sessionTimeout = parseInt(data.sessiontimeout, 10);
      if (isNaN(sessionTimeout) || sessionTimeout < 1 || sessionTimeout > 999) {
        errors.sessiontimeout = 'Session Timeout must be a number between 1 and 999.';
      }
    }
  
    
    if (isNonEmptyString(data.passwordattempts)) {
      const passwordAttempts = parseInt(data.passwordattempts, 10);
      if (isNaN(passwordAttempts) || passwordAttempts < 1 || passwordAttempts > 999) {
        errors.passwordattempts = 'Password Attempts must be a number between 1 and 999.';
      }
    }
  
    
    if (!data.passwordneverexpires) {
      if (isNonEmptyString(data.passwordchangeduration)) {
        const passwordChangeDuration = parseInt(data.passwordchangeduration, 10);
        if (isNaN(passwordChangeDuration) || passwordChangeDuration < 1 || passwordChangeDuration > 999) {
          errors.passwordchangeduration = 'Password Change Duration must be a number between 1 and 999.';
        }
      }
  
      
      if (isNonEmptyString(data.passwordexpirenotification)) {
        const passwordExpireNotification = parseInt(data.passwordexpirenotification, 10);
        if (isNaN(passwordExpireNotification) || passwordExpireNotification < 1 || passwordExpireNotification > 999) {
          errors.passwordexpirenotification = 'Password Expire Notification must be a number between 1 and 999.';
        }
      }
      if (
        isNonEmptyString(data.passwordchangeduration) &&
        isNonEmptyString(data.passwordexpirenotification)
      ) {
        const passwordChangeDuration = parseInt(data.passwordchangeduration, 10);
        const passwordExpireNotification = parseInt(data.passwordexpirenotification, 10);
        if (passwordChangeDuration < passwordExpireNotification){
          errors.passwordchangeduration = 'Password Change Duration must be greater than or equal to Password Expire Notification.';
        }
        if(passwordExpireNotification>passwordChangeDuration){
          errors.passwordchangeduration = 'Password Change Duration must be greater than or equal to Password Expire Notification.';
        
        }
      }
    }

    if (isNonEmptyString(data.status)) {
      if (!data.status) {
        errors.status = 'Please select a status.';
      }
    }
  
    return errors;
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value; 
    setFormData((prevFormData) => {
      let updatedFormData = {
        ...prevFormData,
        [name]: newValue,
      };
  
      if (['sessiontimeout', 'passwordattempts', 'passwordchangeduration', 'passwordexpirenotification'].includes(name)) {
        const numericValue = newValue.replace(/[^0-9]/g, ''); 
        updatedFormData[name] = numericValue; 
      }
  
      if (name === 'passwordneverexpires' && checked) {
        updatedFormData.passwordchangeduration = '';
        updatedFormData.passwordexpirenotification = '';
      }
  
      return updatedFormData;
    });
  
  
    const validationErrors = validateFormData({
      ...formData,
      [name]: newValue,
    });
    setErrors(validationErrors);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const { policyname, sessiontimeout, passwordattempts, passwordneverexpires,passwordchangeduration, passwordexpirenotification, status } = formData;

    if (!policyname || !sessiontimeout || !passwordattempts || !status) {
      return; 
  }

  if (!passwordneverexpires && (!passwordchangeduration || !passwordexpirenotification)) {
      return;  
  }
    const validationErrors = validateFormData(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/EditPolicy/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          passwordchangeduration: formData.passwordneverexpires ? null : formData.passwordchangeduration,
          passwordexpirenotification: formData.passwordneverexpires ? null : formData.passwordexpirenotification,
        }),
      });
    
      if (response.ok) {
        const policyName = formData.policyname || 'Policy'; 
        toast.success(`Policy ${policyName} updated successfully!`);
        
        log('PUT /api/EditPolicy', 'Success', 200, `Policy ${policyName} updated successfully`);
        
      } else {
        toast.error('Failed to update policy');
        
        log('PUT /api/EditPolicy', 'Error', response.status, 'Failed to update policy');
      }
    } catch (error) {
      console.error('Error updating policy:', error);
      toast.error('An error occurred while updating the policy.');
      
      log('PUT /api/EditPolicy', 'Error', 500, 'An error occurred while updating the policy');
      
      return;
    }
  }
  const handleRedirect = () => {
    navigate('/GetPolicy');
  };

  const handleReset = () => {
    setFormData({
      policyname: formData.policyname,
      sessiontimeout: '',
      passwordattempts: '',
      passwordneverexpires: false,
      passwordchangeduration: '',
      passwordexpirenotification: '',
      status: '',

    });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className={styles.formContainer}>
      {loading ? (
        <p>Loading policy...</p>
      ) : (
        <form onSubmit={handleSubmit}>
           <h1>Company IT Policy Master</h1>
          <div className={styles.formGroup}>
            <label>
              Policy Name: {submitted && !formData.policyname && <span className={styles.requiredAsterisk}>*</span>}
            </label>
            <input
              type="text"
              name="policyname"
              value={formData.policyname}
              onChange={handleInputChange}
              readOnly
            />
          </div>
          <div className={styles.formGroup}>
            <label>
              Session Timeout: {submitted && !formData.sessiontimeout && <span className={styles.requiredAsterisk}>*</span>}
            </label>
            <input
              type="text"
              name="sessiontimeout"
              value={formData.sessiontimeout}
              onChange={handleInputChange}
            />
            {errors.sessiontimeout && <p className={styles.error}>{errors.sessiontimeout}</p>}
          </div>
          <div className={styles.formGroup}>
            <label>
              Password Attempts: {submitted && !formData.passwordattempts && <span className={styles.requiredAsterisk}>*</span>}
            </label>
            <input
              type="text"
              name="passwordattempts"
              value={formData.passwordattempts}
              onChange={handleInputChange}
            />
            {errors.passwordattempts && <p className={styles.error}>{errors.passwordattempts}</p>}
          </div>
          <div className={styles.formGroup}>
            <label>Password Never Expires:</label>
            <input
              type="checkbox"
              name="passwordneverexpires"
              checked={formData.passwordneverexpires}
              onChange={handleInputChange}
            />
          </div>
          {!formData.passwordneverexpires && (
            <>
              <div className={styles.formGroup}>
                <label>
                  Password Change Duration: {submitted && !formData.passwordchangeduration && <span className={styles.requiredAsterisk}>*</span>}
                </label>
                <input
                  type="text"
                  name="passwordchangeduration"
                  value={formData.passwordchangeduration}
                  onChange={handleInputChange}
                />
                {errors.passwordchangeduration && <p className={styles.error}>{errors.passwordchangeduration}</p>}
              </div>
              <div className={styles.formGroup}>
                <label>
                  Password Expire Notification: {submitted && !formData.passwordexpirenotification && <span className={styles.requiredAsterisk}>*</span>}
                </label>
                <input
                  type="text"
                  name="passwordexpirenotification"
                  value={formData.passwordexpirenotification}
                  onChange={handleInputChange}
                />
                {errors.passwordexpirenotification && <p className={styles.error}>{errors.passwordexpirenotification}</p>}
              </div>
            </>
          )}
          <div className={styles.formGroup}>
            <label>
              Status: {submitted && !formData.status && <span className={styles.requiredAsterisk}>*</span>}
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="1">Active</option>
              <option value="2">Inactive</option>
            </select>
            {errors.status && <p className={styles.error}>{errors.status}</p>}
          </div>
          <button type="submit" className={styles.submitButton}>Submit</button>
          <button type="button" onClick={handleReset} className={styles.ResetButton}>Reset</button>
          <button type="button" onClick={handleRedirect} className={styles.ListButton}>List</button>
        </form>
      )}
    </div>
  );
};

export default EditPolicy;
