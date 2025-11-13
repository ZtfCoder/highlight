


const PreviewText = (props: { highlight: HighlightItem }) => {
  const { highlight } = props;
  return (
    <p style={{
      fontSize: "13px",
      lineHeight: "1.4",
      margin: "10px 0"
    }}>
      注册资本为壹佰万圆整，法定代表人为阙飞洋。
      <span
        style={{
          backgroundColor: highlight.color,
          color: highlight.textColor || "#fff",
          textDecoration: highlight.isUnderline
            ? "underline"
            : highlight.isWavy
            ? "underline wavy"
            : "none",
        }}
      >
        {highlight.text}
      </span>
      法律、法规、国务院决定规定应当许可（审批）的，经审批机关批准后凭许可（审批）文件经营;
      <span
        style={{
          backgroundColor: highlight.color,
          color: highlight.textColor || "#fff",
          textDecoration: highlight.isUnderline
            ? "underline"
            : highlight.isWavy
            ? "underline wavy"
            : "none",
        }}
      >
        {highlight.text}
      </span>
      粮食收购；初级农产品收购。
    </p>
  );
}

export default PreviewText;