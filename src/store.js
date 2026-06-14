// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';

const getSnapshot = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  nodeIDs: state.nodeIDs,
});

const withHistory = (state, changes) => ({
  ...changes,
  past: [...state.past, getSnapshot(state)].slice(-50),
  future: [],
});

const withHistorySnapshot = (state, snapshot, changes) => ({
  ...changes,
  past: [...state.past, snapshot].slice(-50),
  future: [],
  activeDragSnapshot: null,
});

export const useStore = create((set, get) => ({
    nodes: [],
    edges: [],
    nodeIDs: {},
    past: [],
    future: [],
    activeDragSnapshot: null,
    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({ nodeIDs: newIDs });
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set((state) => withHistory(state, {
            nodes: [...get().nodes, node]
        }));
    },
    onNodesChange: (changes) => {
      const lockedNodeIds = new Set(
        get().nodes
          .filter((node) => node.data?.locked)
          .map((node) => node.id),
      );
      const allowedChanges = changes.filter(
        (change) =>
          change.type !== "position" || !lockedNodeIds.has(change.id),
      );

      if (allowedChanges.length === 0) {
        return;
      }

      const nextNodes = applyNodeChanges(allowedChanges, get().nodes);
      const isOnlySelection = allowedChanges.every((change) => change.type === "select");
      const hasActiveDrag = allowedChanges.some(
        (change) => change.type === "position" && change.dragging,
      );
      const hasFinishedDrag = allowedChanges.some(
        (change) => change.type === "position" && change.dragging === false,
      );

      if (isOnlySelection) {
        set({ nodes: nextNodes });
        return;
      }

      if (hasActiveDrag) {
        set((state) => ({
          nodes: nextNodes,
          activeDragSnapshot: state.activeDragSnapshot ?? getSnapshot(state),
        }));
        return;
      }

      if (hasFinishedDrag && get().activeDragSnapshot) {
        set((state) =>
          withHistorySnapshot(state, state.activeDragSnapshot, {
            nodes: nextNodes,
          }),
        );
        return;
      }

      set((state) => withHistory(state, {
        nodes: nextNodes,
      }));
    },
    onEdgesChange: (changes) => {
      const nextEdges = applyEdgeChanges(changes, get().edges);
      const isOnlySelection = changes.every((change) => change.type === "select");

      set((state) => isOnlySelection ? { edges: nextEdges } : withHistory(state, {
        edges: nextEdges,
      }));
    },
    onConnect: (connection) => {
      set((state) => withHistory(state, {
        edges: addEdge({...connection, type: 'smoothstep', animated: true, markerEnd: {type: MarkerType.Arrow, height: '20px', width: '20px'}}, get().edges),
      }));
    },
    undo: () => {
      const { past, future } = get();
      if (past.length === 0) return;

      const previous = past[past.length - 1];
      set((state) => ({
        ...previous,
        past: past.slice(0, -1),
        future: [getSnapshot(state), ...future],
        activeDragSnapshot: null,
      }));
    },
    redo: () => {
      const { past, future } = get();
      if (future.length === 0) return;

      const next = future[0];
      set((state) => ({
        ...next,
        past: [...past, getSnapshot(state)],
        future: future.slice(1),
        activeDragSnapshot: null,
      }));
    },
    deleteSelected: () => {
      const selectedNodeIds = new Set(get().nodes.filter((node) => node.selected).map((node) => node.id));
      const selectedEdgeIds = new Set(get().edges.filter((edge) => edge.selected).map((edge) => edge.id));

      if (selectedNodeIds.size === 0 && selectedEdgeIds.size === 0) return;

      set((state) => withHistory(state, {
        nodes: state.nodes.filter((node) => !selectedNodeIds.has(node.id)),
        edges: state.edges.filter(
          (edge) =>
            !selectedEdgeIds.has(edge.id) &&
            !selectedNodeIds.has(edge.source) &&
            !selectedNodeIds.has(edge.target),
        ),
      }));
    },
    duplicateSelected: () => {
      const selectedNodes = get().nodes.filter((node) => node.selected);
      if (selectedNodes.length === 0) return;

      const newIDs = { ...get().nodeIDs };
      const idMap = new Map();
      const duplicatedNodes = selectedNodes.map((node) => {
        const nextCount = (newIDs[node.type] ?? 0) + 1;
        newIDs[node.type] = nextCount;
        const nextId = `${node.type}-${nextCount}`;
        idMap.set(node.id, nextId);

        return {
          ...node,
          id: nextId,
          selected: true,
          position: {
            x: node.position.x + 48,
            y: node.position.y + 48,
          },
          data: {
            ...node.data,
            id: nextId,
          },
        };
      });
      const duplicatedEdges = get().edges
        .filter((edge) => idMap.has(edge.source) && idMap.has(edge.target))
        .map((edge) => ({
          ...edge,
          id: `${idMap.get(edge.source)}-${idMap.get(edge.target)}`,
          source: idMap.get(edge.source),
          target: idMap.get(edge.target),
          selected: false,
        }));

      set((state) => withHistory(state, {
        nodes: [
          ...state.nodes.map((node) => ({ ...node, selected: false })),
          ...duplicatedNodes,
        ],
        edges: [
          ...state.edges.map((edge) => ({ ...edge, selected: false })),
          ...duplicatedEdges,
        ],
        nodeIDs: newIDs,
      }));
    },
    toggleSelectedLock: () => {
      const selectedNodes = get().nodes.filter((node) => node.selected);
      if (selectedNodes.length === 0) return;

      const shouldLock = selectedNodes.some((node) => !node.data?.locked);

      set((state) => withHistory(state, {
        nodes: state.nodes.map((node) => {
          if (!node.selected) {
            return node;
          }

          return {
            ...node,
            draggable: !shouldLock,
            connectable: !shouldLock,
            data: {
              ...node.data,
              locked: shouldLock,
            },
          };
        }),
      }));
    },
    autoLayout: () => {
      if (get().nodes.length === 0) return;

      set((state) => withHistory(state, {
        nodes: state.nodes.map((node, index) => ({
          ...node,
          position: {
            x: 120 + (index % 4) * 260,
            y: 120 + Math.floor(index / 4) * 180,
          },
        })),
      }));
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set((state) => withHistory(state, {
        nodes: state.nodes.map((node) => {
          if (node.id === nodeId) {
            node.data = { ...node.data, [fieldName]: fieldValue };
          }
  
          return node;
        }),
      }));
    },
    clearPipeline: () => {
      set((state) => withHistory(state, { nodes: [], edges: [], nodeIDs: {} }));
    },
  }));
