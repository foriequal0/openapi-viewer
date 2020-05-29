import { JSONSchema7 } from "json-schema";

export type OpenAPIDocumentIndex = OpenAPIDocumentGroup[];
export type OpenAPIDocumentGroup = { id: string; name: string; documents: OpenAPIDocument[] };
export type OpenAPIDocument = {
  id: string;
  name: string;
  url: string;
};

const documentSchema: JSONSchema7 = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    url: { type: "string" },
  },
};

export const openAPIDocumentGroupsSchema: JSONSchema7 = {
  type: "array",
  items: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      documents: { type: "array", items: documentSchema },
    },
  },
};

export function getDocumentGroup(index: OpenAPIDocumentIndex, groupId: string) {
  return index.filter((group) => group.id === groupId)[0];
}

export function getDocument(
  index: OpenAPIDocumentIndex,
  groupId: string,
  documentId: string
): { group: OpenAPIDocumentGroup; document: OpenAPIDocument } {
  const group = index.filter((group) => group.id === groupId)[0];
  const document = group.documents.filter((document) => document.id === documentId)[0];
  return { group, document };
}
