// toolbar.js

import { DraggableNode } from "./draggableNode";
import { NODE_ORDER, getNodeDefinition } from "./nodes/nodeDefinitions";

export const PipelineToolbar = () => {
  const toolbarNodes = NODE_ORDER.map((type) => ({
    type,
    ...getNodeDefinition(type),
  }));

  return (
    <div className="toolbar-shell">
      <div className="toolbar-shell__header">
        <div>
          <div className="toolbar-shell__eyebrow">Node Library</div>
        </div>
        <div className="toolbar-shell__hint">Drag a node into the canvas</div>
      </div>

      <div className="toolbar-shell__list">
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
