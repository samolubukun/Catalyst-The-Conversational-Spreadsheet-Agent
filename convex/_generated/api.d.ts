/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents from "../agents.js";
import type * as dashboards from "../dashboards.js";
import type * as files from "../files.js";
import type * as messages from "../messages.js";
import type * as presence from "../presence.js";
import type * as sandbox from "../sandbox.js";
import type * as sheets from "../sheets.js";
import type * as users from "../users.js";
import type * as versions from "../versions.js";
import type * as workbooks from "../workbooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agents: typeof agents;
  dashboards: typeof dashboards;
  files: typeof files;
  messages: typeof messages;
  presence: typeof presence;
  sandbox: typeof sandbox;
  sheets: typeof sheets;
  users: typeof users;
  versions: typeof versions;
  workbooks: typeof workbooks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
