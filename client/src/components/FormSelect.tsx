import React from 'react';
import { FieldError } from 'react-hook-form';
import styles from './FormSelect.module.css';

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: FieldError;
  children: React.ReactNode;
}

const FormSelect = React.forwardRef<HTMLSelectElement, Props>(
  ({ label, error, id, children, ...rest }, ref) => {
    const selectId = id || rest.name;

    return (
      <div className={styles.field}>
        <label htmlFor={selectId} className={styles.label}>{label}</label>
        <select
          ref={ref}
          id={selectId}
          className={styles.select}
          {...rest}
        >
          {children}
        </select>
        {error && <p className={styles.error}>{error.message}</p>}
      </div>
    );
  }
);

export default FormSelect;
