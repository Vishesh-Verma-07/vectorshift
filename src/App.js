import { useCallback, useState } from "react";
import { SubmitButton } from "./submit";
import { PipelineToolbar } from "./toolbar";
import { PipelineUI } from "./ui";
import { useStore } from "./store";

function App() {
  const [isNodeLibraryOpen, setIsNodeLibraryOpen] = useState(true);
  const [canvasControls, setCanvasControls] = useState(null);
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const past = useStore((s) => s.past);
  const future = useStore((s) => s.future);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const deleteSelected = useStore((s) => s.deleteSelected);
  const duplicateSelected = useStore((s) => s.duplicateSelected);
  const toggleSelectedLock = useStore((s) => s.toggleSelectedLock);
  const autoLayout = useStore((s) => s.autoLayout);
  const hasSelection =
    nodes.some((node) => node.selected) || edges.some((edge) => edge.selected);
  const selectedNodes = nodes.filter((node) => node.selected);
  const hasSelectedNodes = selectedNodes.length > 0;
  const selectedNodesAreLocked =
    hasSelectedNodes && selectedNodes.every((node) => node.data?.locked);

  const handleCanvasReady = useCallback((instance) => {
    setCanvasControls({
      zoomIn: () => instance.zoomIn(),
      zoomOut: () => instance.zoomOut(),
      fitView: () => instance.fitView({ padding: 0.2 }),
    });
  }, []);

  return (
    <div className="app-shell">
      <header className="top-banner" aria-label="Pipeline page header">
        <div className="top-banner__group" aria-label="Canvas options">
          <button
            className={`top-banner__button${
              isNodeLibraryOpen ? " top-banner__button--active" : ""
            }`}
            type="button"
            aria-controls="node-library"
            aria-expanded={isNodeLibraryOpen}
            onClick={() => setIsNodeLibraryOpen((isOpen) => !isOpen)}
          >
            Nodes
          </button>
          <div className="top-banner__divider" aria-hidden="true" />
          <button
            className="top-banner__button top-banner__button--short"
            type="button"
            disabled={past.length === 0}
            onClick={undo}
          >
            Undo
          </button>
          <button
            className="top-banner__button top-banner__button--short"
            type="button"
            disabled={future.length === 0}
            onClick={redo}
          >
            Redo
          </button>
          <div className="top-banner__divider" aria-hidden="true" />
          <button
            className="top-banner__button top-banner__button--icon"
            type="button"
            aria-label="Zoom in"
            disabled={!canvasControls}
            onClick={() => canvasControls?.zoomIn()}
          >
            +
          </button>
          <button
            className="top-banner__button top-banner__button--icon"
            type="button"
            aria-label="Zoom out"
            disabled={!canvasControls}
            onClick={() => canvasControls?.zoomOut()}
          >
            -
          </button>
          <button
            className="top-banner__button top-banner__button--short"
            type="button"
            disabled={!canvasControls}
            onClick={() => canvasControls?.fitView()}
          >
            Fit
          </button>
          <div className="top-banner__divider" aria-hidden="true" />
          <button
            className={`top-banner__button${
              selectedNodesAreLocked ? " top-banner__button--active" : ""
            }`}
            type="button"
            aria-pressed={selectedNodesAreLocked}
            disabled={!hasSelectedNodes}
            onClick={toggleSelectedLock}
          >
            {selectedNodesAreLocked ? "Unlock" : "Lock"}
          </button>
          <button
            className="top-banner__button top-banner__button--short"
            type="button"
            disabled={!hasSelection}
            onClick={deleteSelected}
          >
            Delete
          </button>
          <button
            className="top-banner__button top-banner__button--short"
            type="button"
            disabled={!nodes.some((node) => node.selected)}
            onClick={duplicateSelected}
          >
            Duplicate
          </button>
          <button
            className="top-banner__button"
            type="button"
            disabled={nodes.length === 0}
            onClick={() => {
              autoLayout();
              window.requestAnimationFrame(() => canvasControls?.fitView());
            }}
          >
            Auto Layout
          </button>
        </div>
      </header>

      <main
        className={`workspace-shell${
          isNodeLibraryOpen ? "" : " workspace-shell--library-closed"
        }`}
      >
        <section
          className={`toolbar-panel${
            isNodeLibraryOpen ? "" : " toolbar-panel--closed"
          }`}
          id="node-library"
          aria-label="Node library"
          aria-hidden={!isNodeLibraryOpen}
        >
          <PipelineToolbar />
        </section>

        <section className="canvas-panel" aria-label="Pipeline canvas">
          <PipelineUI onCanvasReady={handleCanvasReady} />
        </section>
      </main>

      <footer className="submit-footer">
        <SubmitButton />
      </footer>
    </div>
  );
}

export default App;
