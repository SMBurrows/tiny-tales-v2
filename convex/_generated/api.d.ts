/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as aiGeneration from "../aiGeneration.js";
import type * as auth from "../auth.js";
import type * as characters from "../characters.js";
import type * as http from "../http.js";
import type * as images from "../images.js";
import type * as router from "../router.js";
import type * as scrapbooks from "../scrapbooks.js";
import type * as stories from "../stories.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  aiGeneration: typeof aiGeneration;
  auth: typeof auth;
  characters: typeof characters;
  http: typeof http;
  images: typeof images;
  router: typeof router;
  scrapbooks: typeof scrapbooks;
  stories: typeof stories;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
