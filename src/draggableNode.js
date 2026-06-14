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
      className={`draggable-node draggable-node--${type}`}
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={(event) => (event.target.style.cursor = "grab")}
      whileHover={{ y: -4, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      style={{
        "--node-accent": accent,
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
      <span className="draggable-node__label">{label}</span>
      <span className="draggable-node__description">{description}</span>
    </motion.div>
  );
};
