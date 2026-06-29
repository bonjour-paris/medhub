import React from 'react';
import { FieldError } from 'react-hook-form';
import styles from './FormInput.module.css';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
}

const FormInput = React.forwardRef<HTMLInputElement, Props>(
  ({ label, error, id, ...rest }, ref) => {
    const inputId = id || rest.name;

    return (
      <div className={styles.field}>
        <label htmlFor={inputId} className={styles.label}>{label}</label>
        <input
          ref={ref}
          id={inputId}
          className={styles.input}
          autoComplete="off"
          {...rest}
        />
        {error && <p className={styles.error}>{error.message}</p>}
      </div>
    );
  }
);

export default FormInput;
