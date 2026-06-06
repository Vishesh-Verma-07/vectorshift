import { motion } from "motion/react";

export const DraggableNode = ({
  type,
  label,
  description,
  accent = "#1C2536",
}) => {
  const onDragStart = (event, nodeType) => {
    const appData = { nodeType };
    event.target.style.cursor = "grabbing";
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(appData),
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <motion.div
      className={type}
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={(event) => (event.target.style.cursor = "grab")}
      whileHover={{ y: -4, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      style={{
        cursor: "grab",
        minWidth: "120px",
        minHeight: "72px",
        padding: "12px 14px",
        display: "flex",
        gap: "4px",
        alignItems: "center",
        borderRadius: "12px",
        background: `linear-gradient(180deg, ${accent} 0%, #111827 100%)`,
        boxShadow: "0 18px 30px rgba(15, 23, 42, 0.18)",
        justifyContent: "center",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
      draggable
    >
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0.18, scale: 0.95 }}
        animate={{ opacity: [0.12, 0.24, 0.12], scale: [0.98, 1.04, 0.98] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: -20,
          background:
            "radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 58%)",
          pointerEvents: "none",
        }}
      />
      <span style={{ color: "#fff", fontWeight: 700 }}>{label}</span>
      <span
        style={{
          color: "rgba(255,255,255,0.76)",
          fontSize: "12px",
          textAlign: "center",
        }}
      >
        {description}
      </span>
    </motion.div>
  );
};
