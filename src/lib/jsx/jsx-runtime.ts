/**
 * The site's own way of making elements: React's, plus drawing an editor's bold and italic (./rich.ts).
 * Named and shaped as the build expects (`jsxImportSource` in vite.config.ts); nothing imports it by hand.
 */
import * as runtime from "react/jsx-runtime";
import { fix } from "./rich.ts";

export const Fragment = runtime.Fragment;
export const jsx: typeof runtime.jsx = (type, props, key) => runtime.jsx(type, fix(type, props), key);
export const jsxs: typeof runtime.jsxs = (type, props, key) => runtime.jsxs(type, fix(type, props), key);
