import styles from "./index.module.scss";

type SelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  options: { label: string; value: string }[];
  id?: string;
};

const Select = (props: SelectProps) => {
  const { value, onChange, options, id } = props;

  return (
    // 用于美化 select 的容器
    <div className={styles.customSelect}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className={styles.selectArrow}>
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M7 10l5 5 5-5z"></path>
        </svg>
      </span>
    </div>
  );
};

export default Select;
