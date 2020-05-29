import { JSONSchema7 } from "json-schema";

export type OpenAPIDocumentGroups = OpenAPIDocumentGroup[];
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

export function getDocumentGroup(documents: OpenAPIDocumentGroups, groupId: string) {
  return documents.filter((group) => group.id === groupId)[0];
}

export function getDocument(
  documents: OpenAPIDocumentGroups,
  groupId: string,
  documentId: string
): { group: OpenAPIDocumentGroup; document: OpenAPIDocument } {
  const group = documents.filter((group) => group.id === groupId)[0];
  const document = group.documents.filter((document) => document.id === documentId)[0];
  return { group, document };
}
