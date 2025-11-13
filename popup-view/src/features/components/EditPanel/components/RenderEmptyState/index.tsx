import styles from "../../EditPanel.module.scss";
/**
 * 空状态
 * @returns
 */
const RenderEmptyState = () => (
  <div className={styles.emptyState}>
    <p>请选择左侧菜单项或高亮词进行操作</p>
  </div>
);

export default RenderEmptyState;
