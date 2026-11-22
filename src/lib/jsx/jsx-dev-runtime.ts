/** The same as ./jsx-runtime.ts, for the development server (which makes elements through React's checking version). */
import * as runtime from "react/jsx-dev-runtime";
import { fix } from "./rich.ts";

export const Fragment = runtime.Fragment;
export const jsxDEV: typeof runtime.jsxDEV = (type, props, key, isStatic, source, self) => runtime.jsxDEV(type, fix(type, props), key, isStatic, source, self);
