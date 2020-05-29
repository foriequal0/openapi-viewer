export type OpenAPIDocumentGroups = OpenAPIDocumentGroup[];
export type OpenAPIDocumentGroup = { id: string; name: string; documents: OpenAPIDocument[] };
export type OpenAPIDocument = {
  id: string;
  name: string;
  url: string;
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
