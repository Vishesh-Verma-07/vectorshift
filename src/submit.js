// submit.js

import { useCallback } from "react";
import { useStore } from "./store";

export const SubmitButton = () => {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);

  const handleSubmit = useCallback(async () => {
    try {
      const resp = await fetch("http://localhost:8000/pipelines/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data = await resp.json();
      const msg = `Pipeline summary:\n- Nodes: ${data.num_nodes}\n- Edges: ${data.num_edges}\n- Is DAG: ${data.is_dag ? "Yes" : "No"}`;
      alert(msg);
    } catch (err) {
      console.error("Submit failed", err);
      alert("Failed to submit pipeline: " + err.message);
    }
  }, [nodes, edges]);

  return (
    <div className="submit-shell">
      <button className="submit-shell__button" type="button" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};
