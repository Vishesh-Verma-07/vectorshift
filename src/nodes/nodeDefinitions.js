const createDefaultName =
  (prefix) =>
  ({ id }) =>
    id.replace(`${prefix}-`, `${prefix}_`);

const templateVariablePattern = /\{\{\s*([A-Za-z_$][\w$]*)\s*\}\}/g;

const uniqueTemplateVariables = (text = "") => {
  const matches = [...text.matchAll(templateVariablePattern)];
  const seen = new Set();

  return matches.reduce((variables, match) => {
    const variableName = match[1];

    if (!seen.has(variableName)) {
      seen.add(variableName);
      variables.push(variableName);
    }

    return variables;
  }, []);
};

const estimateTextNodeSize = (text = "", size = {}) => {
  const lines = String(text).split("\n");
  const longestLineLength = lines.reduce(
    (longest, line) => Math.max(longest, line.length),
    0,
  );
  const lineCount = Math.max(lines.length, 1);

  return {
    width: Math.min(
      size.maxWidth ?? 560,
      Math.max(size.minWidth ?? 300, 220 + longestLineLength * 8),
    ),
    height: Math.min(
      size.maxHeight ?? 420,
      Math.max(size.minHeight ?? 180, 110 + lineCount * 28),
    ),
  };
};

export const NODE_DEFINITIONS = {
  customInput: {
    title: "Input",
    subtitle: "Entry point into the pipeline",
    accent: "#2563eb",
    width: 280,
    fields: [
      {
        key: "inputName",
        label: "Name",
        type: "text",
        defaultValue: createDefaultName("customInput"),
      },
      {
        key: "inputType",
        label: "Type",
        type: "select",
        options: ["Text", "File"],
        defaultValue: "Text",
      },
    ],
    handles: [{ idSuffix: "value", type: "source", position: "right" }],
  },
  customOutput: {
    title: "Output",
    subtitle: "Terminal sink for data",
    accent: "#ea580c",
    width: 280,
    fields: [
      {
        key: "outputName",
        label: "Name",
        type: "text",
        defaultValue: createDefaultName("customOutput"),
      },
      {
        key: "outputType",
        label: "Type",
        type: "select",
        options: ["Text", "File"],
        defaultValue: "Text",
      },
    ],
    handles: [{ idSuffix: "value", type: "target", position: "left" }],
  },
  llm: {
    title: "LLM",
    subtitle: "Language model hop",
    accent: "#7c3aed",
    width: 300,
    fields: [
      {
        key: "modelName",
        label: "Model",
        type: "text",
        defaultValue: "gpt-5.4-mini",
      },
      {
        key: "temperature",
        label: "Temperature",
        type: "number",
        defaultValue: 0.7,
        step: "0.1",
      },
    ],
    handles: [
      {
        idSuffix: "system",
        type: "target",
        position: "left",
        style: { top: "30%" },
      },
      {
        idSuffix: "prompt",
        type: "target",
        position: "left",
        style: { top: "58%" },
      },
      { idSuffix: "response", type: "source", position: "right" },
    ],
  },
  text: {
    title: "Text",
    subtitle: "Template variable expansion",
    accent: "#0f766e",
    width: 300,
    layout: {
      inputKey: "text",
      minWidth: 300,
      maxWidth: 560,
      minHeight: 180,
      maxHeight: 420,
      getSize: estimateTextNodeSize,
    },
    fields: [
      {
        key: "text",
        label: "Text",
        type: "textarea",
        defaultValue: "{{input}}",
      },
    ],
    getDynamicHandles: (values) => uniqueTemplateVariables(values.text),
    handles: [{ idSuffix: "output", type: "source", position: "right" }],
  },
  prompt: {
    title: "Prompt",
    subtitle: "Reusable instruction block",
    accent: "#db2777",
    width: 300,
    fields: [
      {
        key: "promptName",
        label: "Name",
        type: "text",
        defaultValue: createDefaultName("prompt"),
      },
      {
        key: "role",
        label: "Role",
        type: "select",
        options: ["system", "user", "assistant"],
        defaultValue: "system",
      },
      {
        key: "promptText",
        label: "Prompt",
        type: "textarea",
        defaultValue: "Write a concise response.",
      },
    ],
    handles: [
      { idSuffix: "context", type: "target", position: "left" },
      { idSuffix: "prompt", type: "source", position: "right" },
    ],
  },
  parser: {
    title: "Parser",
    subtitle: "Shape output into structure",
    accent: "#0891b2",
    width: 320,
    fields: [
      {
        key: "format",
        label: "Format",
        type: "select",
        options: ["JSON", "YAML", "CSV"],
        defaultValue: "JSON",
      },
      { key: "strict", label: "Strict", type: "checkbox", defaultValue: true },
    ],
    handles: [
      { idSuffix: "raw", type: "target", position: "left" },
      { idSuffix: "parsed", type: "source", position: "right" },
    ],
  },
  memory: {
    title: "Memory",
    subtitle: "Persist context between runs",
    accent: "#16a34a",
    width: 320,
    fields: [
      {
        key: "scope",
        label: "Scope",
        type: "select",
        options: ["session", "shared"],
        defaultValue: "session",
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
        defaultValue: "Store key context here.",
      },
    ],
    handles: [
      { idSuffix: "read", type: "target", position: "left" },
      { idSuffix: "write", type: "source", position: "right" },
    ],
  },
  router: {
    title: "Router",
    subtitle: "Branch by rule",
    accent: "#8b5cf6",
    width: 340,
    fields: [
      {
        key: "rule",
        label: "Rule",
        type: "text",
        defaultValue: "route by keyword",
      },
      {
        key: "strategy",
        label: "Strategy",
        type: "select",
        options: ["keyword", "score", "schema"],
        defaultValue: "keyword",
      },
    ],
    handles: [
      { idSuffix: "input", type: "target", position: "left" },
      {
        idSuffix: "primary",
        type: "source",
        position: "right",
        style: { top: "34%" },
      },
      {
        idSuffix: "fallback",
        type: "source",
        position: "right",
        style: { top: "66%" },
      },
    ],
  },
  validator: {
    title: "Validator",
    subtitle: "Check payloads before use",
    accent: "#dc2626",
    width: 320,
    fields: [
      {
        key: "schema",
        label: "Schema",
        type: "textarea",
        defaultValue: '{\n  "type": "object"\n}',
      },
      {
        key: "required",
        label: "Required",
        type: "checkbox",
        defaultValue: true,
      },
    ],
    handles: [
      { idSuffix: "input", type: "target", position: "left" },
      { idSuffix: "valid", type: "source", position: "right" },
    ],
  },
};

export const NODE_ORDER = [
  "customInput",
  "llm",
  "customOutput",
  "text",
  "prompt",
  "parser",
  "memory",
  "router",
  "validator",
];

export const getNodeDefinition = (type) =>
  NODE_DEFINITIONS[type] ?? NODE_DEFINITIONS.text;

export const buildNodeData = (id, type) => {
  const definition = getNodeDefinition(type);
  const fieldDefaults = definition.fields.reduce((accumulator, field) => {
    const value =
      typeof field.defaultValue === "function"
        ? field.defaultValue({ id, type })
        : field.defaultValue;
    accumulator[field.key] = value;
    return accumulator;
  }, {});

  return {
    id,
    nodeType: type,
    title: definition.title,
    ...fieldDefaults,
  };
};
