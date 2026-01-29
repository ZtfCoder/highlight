import React from 'react';
import styles from './Switch.module.scss';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean, e?: React.MouseEvent) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  label?: string;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'medium',
  label,
  className = ''
}) => {
  const handleToggle = (e: React.MouseEvent) => {
    if (!disabled) {
      onChange(!checked, e);
    }
  };

  const switchClasses = [
    styles.switch,
    styles[size],
    checked ? styles.checked : '',
    disabled ? styles.disabled : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.switchContainer}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      <div
        className={switchClasses}
        onClick={handleToggle}
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
      >
        <div className={styles.thumb} />
      </div>
    </div>
  );
};

export default Switch;
