import React, { Dispatch, useEffect, useState } from "react";
import { NavLink, useHistory, useLocation, useRouteMatch, Redirect } from "react-router-dom";
import { RedocStandalone } from "redoc";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import yaml, {JSON_SCHEMA} from "js-yaml";
import Ajv from "ajv";

import "./App.css";
import { RouteParams, SelectionEvent, useSelectionState } from "./useSelectionState";
import {
  getDocumentGroup,
  OpenAPIDocument,
  OpenAPIDocumentGroup,
  OpenAPIDocumentIndex,
  openAPIDocumentGroupsSchema,
} from "./documents";

const URL = "https://raw.githubusercontent.com/foriequal0/openapi-viewer/master/documents.yaml";

type FetchState<T> = { state: "LOADING" } | { state: "DONE"; value: T } | { state: "ERROR"; error: any };

export default function App() {
  const [index, setIndex] = useState<FetchState<OpenAPIDocumentIndex>>({
    state: "LOADING",
  });

  useEffect(() => {
    async function doFetch() {
      const fetched = await fetch(URL);
      if (fetched.status >= 400) {
        setIndex({
          state: "ERROR",
          error: `Document fetch error: ${await fetched.text()}`,
        });
        return;
      }

      let index;
      try {
        index = yaml.safeLoad(await fetched.text(), {schema: JSON_SCHEMA});
      } catch(e) {
        setIndex({
          state: "ERROR",
          error: `YAML parse error: ${e}`,
        });
        return;
      }

      const ajv = new Ajv();
      const valid = ajv.validate(openAPIDocumentGroupsSchema, index);
      if (!valid) {
        setIndex({
          state: "ERROR",
          error: `Documents index parse error: ${JSON.stringify(ajv.errors, null, 4)}`,
        });
        return;
      }
      setIndex({
        state: "DONE",
        value: index,
      });
    }

    doFetch();
  }, [URL]);

  switch (index.state) {
    case "LOADING":
      return <>
        <DummyHeader />
        <div className="ui-container loading">
          LOADING {URL}
        </div>
      </>;
    case "DONE":
      return <Root index={index.value} />;
    case "ERROR":
      return <>
        <DummyHeader />
        <div className="ui-container error">
          <p>URL: {URL}</p>
          <p>{index.error}</p>
        </div>
      </>;
  }
}

function Root(props: { index: OpenAPIDocumentIndex }) {
  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch<Partial<RouteParams>>(["/:groupId/:documentId*", "/:group", "/"]);
  const groupId = match?.params?.groupId ?? props.index[0].id;
  const documentId = match?.params?.documentId ?? getDocumentGroup(props.index, groupId).documents[0].id;
  const [state, dispatch] = useSelectionState(props.index, {
    groupId,
    documentId,
  });

  const searchParams = new URLSearchParams(location.search);
  const ui = searchParams.get("ui") ?? "redoc";

  useEffect(() => {
    document.title = `${state.group.name} - ${state.document.name} : ${ui}`;
  }, [state.group, state.document, ui]);

  useEffect(
    () => {
      // URL 변경을 state 에 반영
      if (history.action === "POP") {
        dispatch({
          type: "route",
          groupId,
          documentId,
        });
      }
    },
    // eslint-disable-next-line
    [groupId, documentId]
  );

  function onChange(event: SelectionEvent) {
    // state 변경을 URL 에 반영
    const newState = dispatch(event);
    const path = `/${newState.group.id}/${newState.document.id}${location.search}`;
    history.push(path);
  }

  return (
    <>
      <Header index={props.index} group={state.group} document={state.document} onChange={onChange} />
      <UIContainer ui={ui} url={state.document.url} />
    </>
  );
}

function DummyHeader() {
  return (
    <header>
      <span>OpenAPI Viewer</span>
      <div className="doc-selectors">
        <select>
          <option>Group</option>
        </select>
        <select>
          <option>Document</option>
        </select>
      </div>
      <Navigation/>
    </header>
  );
}

function Header(props: {
  index: OpenAPIDocumentIndex;
  group: OpenAPIDocumentGroup;
  document: OpenAPIDocument;
  onChange: Dispatch<SelectionEvent>;
}) {
  return (
    <header>
      <span>OpenAPI Viewer</span>
      <div className="doc-selectors">
        <select value={props.group.id} onChange={(e) => props.onChange({ type: "group", value: e.target.value })}>
          {props.index.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        <select value={props.document.id} onChange={(e) => props.onChange({ type: "document", value: e.target.value })}>
          {props.group.documents.map((document) => (
            <option key={document.id} value={document.id}>
              {document.name}
            </option>
          ))}
        </select>
      </div>
      <Navigation group={props.group} document={props.document} />
    </header>
  );
}

function Navigation(props: { group?: OpenAPIDocumentGroup; document?: OpenAPIDocument }) {
  function isActive(self: string) {
    return (match: any, location: any) => {
      const searchParams = new URLSearchParams(location.search);
      const ui = searchParams.get("ui") ?? "redoc";
      return ui === self;
    };
  }

  return (
    <nav className="ui-navigator">
      <ul>
        <li>
          <NavLink
            to={{
              pathname: (props.group && props.document) ? `/${props.group.id}/${props.document.id}` : undefined,
              search: "?ui=redoc",
            }}
            activeClassName="selected-ui"
            isActive={isActive("redoc")}
          >
            Redoc
          </NavLink>
        </li>
        <li>
          <NavLink
            to={{
              pathname: (props.group && props.document) ? `/${props.group.id}/${props.document.id}` : undefined,
              search: "?ui=swagger&deepLinking=true",
            }}
            activeClassName="selected-ui"
            isActive={isActive("swagger")}
          >
            Swagger UI
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

function UIContainer({ ui, url }: { ui: string; url: string }) {
  const location = useLocation();
  if (ui === "redoc") {
    return (
      <div className="ui-container redoc">
        <RedocStandalone specUrl={url} />
      </div>
    );
  } else if (ui === "swagger") {
    return (
      <div className="ui-container swagger">
        <SwaggerUI url={url} />
      </div>
    );
  } else {
    return <Redirect to={{ ...location, search: "?ui=redoc" }} />;
  }
}
