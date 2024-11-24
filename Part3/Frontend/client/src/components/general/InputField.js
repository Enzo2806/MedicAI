import React from 'react';

const InputField = ({ label, type, name, value, onChange, hasError }) => {
  return (
    <div className="input-field">
      <label htmlFor={name}>{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={hasError ? 'has-error' : ''}
      />
    </div>
  );
};

export default InputField;