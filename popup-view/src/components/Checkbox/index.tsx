import styles from "./index.module.scss";

type Props = {
  checked: boolean;
   onChange: (checked: boolean) => void;
};
const Checkbox = (props: Props) => {
  const { checked, onChange } = props;
  return (
    <label
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
      }}
    >
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.customCheckbox}></span>
    </label>
  );
};
export default Checkbox;