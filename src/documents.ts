export type OpenAPIDocumentGroups = OpenAPIDocumentGroup[];
export type OpenAPIDocumentGroup = { id: string; name: string; documents: OpenAPIDocument[] };
export type OpenAPIDocument = {
  id: string;
  name: string;
  url: string;
};

export const documents: OpenAPIDocumentGroups = [
  {
    id: "petstore",
    name: "Petstore",
    documents: [
      {
        id: "v2",
        name: "v2",
        url: "https://petstore.swagger.io/v2/swagger.json",
      },
    ],
  },
  {
    id: "aws",
    name: "AWS",
    documents: [
      {
        id: "s3/2006-03-01",
        name: "s3/2006-03-01",
        url: "https://api.apis.guru/v2/specs/amazonaws.com/s3/2006-03-01/openapi.yaml",
      },
      {
        id: "ec2/2016-11-15",
        name: "ec2/2016-11-15",
        url: "https://api.apis.guru/v2/specs/amazonaws.com/ec2/2016-11-15/openapi.yaml",
      },
    ],
  },
];

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
