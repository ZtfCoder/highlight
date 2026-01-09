import styles from "../../EditPanel.module.scss";
import { t } from "../../../../../i18n";

/**
 * 空状态
 * @returns
 */
const RenderEmptyState = () => (
  <div className={styles.emptyState}>
    <p>{t("emptyStateMessage")}</p>
  </div>
);

export default RenderEmptyState;
