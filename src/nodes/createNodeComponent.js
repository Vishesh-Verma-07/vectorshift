import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Handle, Position } from "reactflow";
import { getNodeDefinition } from "./nodeDefinitions";

const positionLookup = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

const baseNodeStyle = {
  borderRadius: 18,
  border: "1px solid rgba(15, 23, 42, 0.10)",
  boxShadow: "0 22px 50px rgba(15, 23, 42, 0.16)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%)",
  color: "#0f172a",
  padding: 14,
  position: "relative",
  overflow: "hidden",
};

const fieldLabelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.02em",
  color: "#334155",
};

const fieldControlStyle = {
  borderRadius: 10,
  border: "1px solid rgba(148, 163, 184, 0.55)",
  padding: "8px 10px",
  fontSize: 13,
  color: "#0f172a",
  background: "#ffffff",
  outline: "none",
};

const nodeVariants = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: "easeOut",
    },
  },
  hover: {
    y: -4,
    boxShadow: "0 30px 65px rgba(15, 23, 42, 0.20)",
    transition: { duration: 0.18, ease: "easeOut" },
  },
  tap: { scale: 0.99 },
};

const contentVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: "easeOut" },
  },
};

const getInitialValues = (definition, id, data) =>
  definition.fields.reduce((accumulator, field) => {
    const fallbackValue =
      typeof field.defaultValue === "function"
        ? field.defaultValue({ id, data })
        : field.defaultValue;
    accumulator[field.key] = data?.[field.key] ?? fallbackValue;
    return accumulator;
  }, {});

const getDynamicHandleLayout = (dynamicHandles = []) => {
  if (!dynamicHandles.length) {
    return [];
  }

  const spacing = 72 / (dynamicHandles.length + 1);

  return dynamicHandles.map((handleId, index) => ({
    idSuffix: `var-${handleId}`,
    type: "target",
    position: "left",
    style: { top: `${(index + 1) * spacing}%` },
    label: handleId,
  }));
};

export const createNodeComponent = (nodeType) => {
  const ConfiguredNode = ({ id, data }) => {
    const definition = getNodeDefinition(nodeType);
    const [values, setValues] = useState(() =>
      getInitialValues(definition, id, data),
    );
    const textAreaRef = useRef(null);

    const dynamicHandles = useMemo(() => {
      if (typeof definition.getDynamicHandles !== "function") {
        return [];
      }

      return definition.getDynamicHandles(values, { id, data });
    }, [definition, values, id, data]);

    const nodeLayout = useMemo(() => {
      if (!definition.layout?.getSize || !definition.layout.inputKey) {
        return null;
      }

      const contentValue = values[definition.layout.inputKey] ?? "";
      return definition.layout.getSize(contentValue, definition.layout);
    }, [definition, values]);

    useEffect(() => {
      if (!textAreaRef.current || nodeType !== "text") {
        return;
      }

      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }, [values]);

    const allHandles = useMemo(
      () => [...definition.handles, ...getDynamicHandleLayout(dynamicHandles)],
      [definition.handles, dynamicHandles],
    );

    const nodeWidth = nodeLayout?.width ?? definition.width ?? 280;
    const nodeMinHeight = nodeLayout?.height ?? definition.minHeight ?? 160;

    return (
      <motion.div
        variants={nodeVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        layout
        style={{
          ...baseNodeStyle,
          width: nodeWidth,
          minHeight: nodeMinHeight,
          borderTop: `4px solid ${definition.accent}`,
        }}
      >
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.16, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            position: "absolute",
            right: -24,
            top: -30,
            width: 96,
            height: 96,
            borderRadius: "999px",
            background: definition.accent,
            filter: "blur(30px)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          variants={contentVariants}
          initial="initial"
          animate="animate"
          style={{ position: "relative", zIndex: 1 }}
        >
          <motion.div
            variants={itemVariants}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: definition.accent,
                  letterSpacing: "-0.02em",
                }}
              >
                {definition.title}
              </span>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                {definition.subtitle}
              </span>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: definition.accent,
                background: `${definition.accent}15`,
                borderRadius: 999,
                padding: "6px 10px",
              }}
            >
              {definition.title}
            </span>
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {definition.fields.map((field) => {
              const fieldValue = values[field.key];
              const handleChange = (event) => {
                const nextValue =
                  field.type === "checkbox"
                    ? event.target.checked
                    : event.target.value;
                setValues((currentValues) => ({
                  ...currentValues,
                  [field.key]: nextValue,
                }));
              };

              return (
                <motion.label
                  key={field.key}
                  variants={itemVariants}
                  style={fieldLabelStyle}
                  whileHover={{ scale: 1.01 }}
                >
                  <span>{field.label}</span>
                  {field.type === "textarea" ? (
                    <textarea
                      ref={textAreaRef}
                      rows={field.rows ?? 3}
                      value={fieldValue}
                      onChange={handleChange}
                      style={{
                        ...fieldControlStyle,
                        resize: "none",
                        minHeight: 72,
                        width: "100%",
                        boxSizing: "border-box",
                        overflow: "hidden",
                      }}
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={fieldValue}
                      onChange={handleChange}
                      style={fieldControlStyle}
                    >
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={Boolean(fieldValue)}
                      onChange={handleChange}
                    />
                  ) : (
                    <input
                      type={field.type ?? "text"}
                      value={fieldValue}
                      onChange={handleChange}
                      step={field.step}
                      placeholder={field.placeholder}
                      style={fieldControlStyle}
                    />
                  )}
                </motion.label>
              );
            })}
          </div>

          {allHandles.map((handle) => (
            <Handle
              key={`${id}-${handle.idSuffix}`}
              type={handle.type}
              position={positionLookup[handle.position]}
              id={`${id}-${handle.idSuffix}`}
              style={{
                background: definition.accent,
                width: 12,
                height: 12,
                border: "2px solid #ffffff",
                ...handle.style,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    );
  };

  return ConfiguredNode;
};
