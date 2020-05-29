import { useState } from "react";

import { getDocument, OpenAPIDocument, OpenAPIDocumentGroup, OpenAPIDocumentIndex } from "./documents";

export type SelectionEvent =
  | { type: "group" | "document"; value: string }
  | { type: "route"; groupId: string; documentId: string };

export type State = {
  group: OpenAPIDocumentGroup;
  document: OpenAPIDocument;
  selectedDocumentIds: { [groupId: string]: string };
};

export type RouteParams = {
  groupId: string;
  documentId: string;
};

export function useSelectionState(
  documents: OpenAPIDocumentIndex,
  routeParams: RouteParams
): [State, (event: SelectionEvent) => State] {
  const [state, setState] = useState(() => {
    const initial: State = {
      ...getDocument(documents, routeParams.groupId, routeParams.documentId),
      selectedDocumentIds: {},
    };

    for (const group of documents) {
      if (routeParams.groupId === group.id) {
        initial.selectedDocumentIds[group.id] = routeParams.documentId;
      } else {
        initial.selectedDocumentIds[group.id] = group.documents[0].id;
      }
    }
    return initial;
  });

  function dispatch(event: SelectionEvent): State {
    let newState: State;
    switch (event.type) {
      case "group":
        newState = {
          ...state,
          ...getDocument(documents, event.value, state.selectedDocumentIds[event.value]),
        };
        break;
      case "document":
        newState = {
          ...state,
          ...getDocument(documents, state.group.id, event.value),
          selectedDocumentIds: {
            ...state.selectedDocumentIds,
            [state.group.id]: event.value,
          },
        };
        break;
      case "route":
        newState = {
          ...state,
          ...getDocument(documents, event.groupId, event.documentId),
        };
        break;
    }
    setState(newState);
    return newState;
  }

  return [state, dispatch];
}
