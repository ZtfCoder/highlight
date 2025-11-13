import React from "react";
import styles from "./index.module.scss";
import Checkbox from "../Checkbox";
import  PreviewText from "../PreviewText";

type Props = {
  highlight: HighlightItem;
  editHighlightId: string | null;
  setEditHighlightId: (id: string | null) => void;
  deleteHighlight: (highlight: HighlightItem) => void;
  onChange: (highlight: Partial<HighlightItem>) => void;
};

const HighlightItem = (props: Props) => {
  const {
    highlight,
    editHighlightId,
    setEditHighlightId,
    deleteHighlight,
    onChange,
  } = props;

  return (
    <div
      key={highlight.id}
      className={`${styles.highlightItem} ${
        editHighlightId == highlight.id && styles.editHightlight
      }`}
      onClick={() => {
        setEditHighlightId(highlight.id);
      }}
    >
      <div className={styles.highlightContent}>
        <div className={styles.pickColorContainer}>
          <div
            className={styles.colorMain}
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: highlight.color }}
          ></div>
          <input
            className={styles.highlightColor}
            type={"color"}
            value={highlight.color}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onChange({ color: e.target.value })}
          />
        </div>
        <div className={styles.highlightText}>{highlight.text}</div>

        <div className={styles.highlightControls}>
          <button
            className={styles.delBtn}
            onClick={(e) => {
              e.stopPropagation();
              deleteHighlight(highlight);
            }}
          >
            x
          </button>
        </div>
      </div>
      {editHighlightId == highlight.id && (
        <>
          <div className={styles.editHightlightContainer}>
            <div className={styles.editHightlightItem}>
              <div>背景颜色</div>
              <div className={styles.pickColorContainer}>
                <div
                  className={styles.colorMain}
                  onClick={(e) => e.stopPropagation()}
                  style={{ backgroundColor: highlight.color }}
                ></div>
                <input
                  className={styles.highlightColor}
                  type={"color"}
                  value={highlight.color}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onChange({ color: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.editHightlightItem}>
              <div>文字颜色</div>
              <div className={styles.pickColorContainer}>
                <div
                  className={styles.colorMain}
                  onClick={(e) => e.stopPropagation()}
                  style={{ backgroundColor: highlight.textColor || "#fff" }}
                ></div>
                <input
                  className={styles.highlightColor}
                  type={"color"}
                  value={highlight.textColor || "#fff"}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onChange({ textColor: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.editHightlightItem}>
              <div>下划线</div>
              <Checkbox
                checked={highlight.isUnderline}
                onChange={(checked) => onChange({ isUnderline: checked })}
              />
            </div>
            <div className={styles.editHightlightItem}>
              <div>波浪线</div>
              <Checkbox
                checked={highlight.isWavy}
                onChange={(checked) => onChange({ isWavy: checked })}
              />
            </div>
          </div>
          <div>效果显示</div>
          <PreviewText highlight={highlight} />
        </>
      )}
    </div>
  );
};

export default HighlightItem;
