import { Node } from "./Node";
import type { FieldNodes, Row, TransitionFields } from "../quizTypes";
import { transitionFields } from "../constants";

export const MERGE_FIELDS_P1 = [
  "fuse type",
  "fuse style",
  "max voltage",
  "max current",
] as const;

function normalize(v: string | undefined): string {
  return (v ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function makeKey(obj: Row, fields: readonly string[]): string {
  return fields.map((f) => normalize(obj[f]) || "∅").join("|");
}

function expandRow(
  row: Row,
  fieldNodesDict: FieldNodes,
  delimiter = ","
): Row[] {
  const entries = Object.entries(row);

  // Start with a single empty row, then build up combinations
  let acc: Row[] = [{}];

  for (const [key, rawValue] of entries) {
    const def = fieldNodesDict[transitionFields[key]];
    const value = rawValue ?? "";

    // Decide whether to split
    const parts =
      def?.breakKeys && value.includes(delimiter)
        ? value
            .split(delimiter)
            .map((v) => v.trim())
            .filter(Boolean)
        : [value];

    // Expand accumulator with this field’s options
    acc = parts.flatMap((part) => acc.map((r) => ({ ...r, [key]: part })));
  }

  return acc;
}

export function makeKeys(
  obj: Row,
  fields: readonly string[],

  fieldNodesDict: FieldNodes
) {
  const keys: string[] = [];
  const names = Object.keys(obj);
  const multiValueNames = names.filter(
    (n) => fieldNodesDict[transitionFields[n]].breakKeys
  );

  if (multiValueNames.length) {
    const valsArray = expandRow(obj, fieldNodesDict, ",");
    valsArray.forEach((vals) => keys.push(makeKey(vals, fields)));
  } else {
    keys.push(makeKey(obj, fields));
  }

  return keys;
}

export function getChildrenByPath(path: string, path1Root: Node) {
  const values = path.split("|");

  const collection: Node[] = getAllChildren(0, path1Root, values, []);

  return collection;
}

function getAllChildren(
  step: number,
  node: Node,
  values: string[],
  collection: Node[]
) {
  if (step === MERGE_FIELDS_P1.length) {
    return node.children;
  }

  const children = node.findAllChildrenThatIncludeValue(values[step]);
  children.forEach((child) => {
    collection = collection.concat(
      getAllChildren(step + 1, child, values, collection)
    );
  });

  return collection;
}

export function getP1MergeValsFromP2Node(
  node: Node,
  tf: TransitionFields
): Row | null {
  const out: Row = {};
  //   const path = node.getPath();
  for (const p1 of MERGE_FIELDS_P1) {
    const p2 = tf[p1] || p1;
    const v = node.data[p2];
    if (!v) return null;
    out[p1] = v;
  }
  return out;
}
