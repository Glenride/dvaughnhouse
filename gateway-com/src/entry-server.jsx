// Server entry for build-time prerendering (see scripts/prerender.mjs).
// Rendered with react-dom/server — no browser APIs run here, so keep
// render-path code free of window/document access (effects are fine).
import { renderToString } from "react-dom/server";
import App from "./App.jsx";

export const routes = ["/", "/donate", "/patron", "/about", "/first-build", "/terms", "/privacy", "/thoughts", "/projects", "/testimonials", "/audit"];

export function render(path) {
  return renderToString(<App path={path} />);
}
