// toolbar.js

import { DraggableNode } from "./draggableNode";
import { NODE_ORDER, getNodeDefinition } from "./nodes/nodeDefinitions";

export const PipelineToolbar = () => {
  const toolbarNodes = NODE_ORDER.map((type) => ({
    type,
    ...getNodeDefinition(type),
  }));

  return (
    <div style={{ padding: "10px" }}>
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {toolbarNodes.map((node) => (
          <DraggableNode
            key={node.type}
            type={node.type}
            label={node.title}
            description={node.subtitle}
            accent={node.accent}
          />
        ))}
      </div>
    </div>
  );
};
