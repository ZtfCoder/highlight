import React from 'react';
import styles from './Switch.module.scss';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
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
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
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
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <div className={styles.thumb} />
      </div>
    </div>
  );
};

export default Switch;
