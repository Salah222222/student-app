export default function Card({ children, className = "", as: Tag = "div", ...rest }) {
  return (
    <Tag
      className={`bg-surface rounded shadow-sm border border-border p-space-2-5 ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
