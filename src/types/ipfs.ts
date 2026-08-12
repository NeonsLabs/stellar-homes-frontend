/**
 * Types for addressing and rendering content stored on IPFS.
 *
 * Milestone evidence, title deeds and inspection reports are all pinned to
 * IPFS and referenced on-chain by their content identifier, so every viewer in
 * the app resolves the same way through these shapes.
 */

import type { CSSProperties } from "react";

/**
 * How a gateway expects the CID to appear in the URL.
 *
 * `path` puts it after `/ipfs/`; `subdomain` puts it in the host, which gives
 * each CID its own browser origin and is the safer of the two.
 */
export type GatewayStyle = "path" | "subdomain";

export interface IpfsGateway {
  id: string;
  /** Name shown in the gateway picker. */
  label: string;
  /** Bare host, no scheme or trailing slash. */
  host: string;
  style: GatewayStyle;
  /** Who operates it, shown as context when switching gateways. */
  operator: string;
}

/** IPFS addresses either immutable content or a mutable name. */
export type IpfsNamespace = "ipfs" | "ipns";

/** A parsed IPFS reference, whatever form it arrived in. */
export interface ParsedIpfsUri {
  namespace: IpfsNamespace;
  /** The CID for `ipfs`, or the name for `ipns`. */
  root: string;
  /** Path inside a directory, without a leading slash. Empty for a bare file. */
  path: string;
  /** Query string carried through to the gateway, without the `?`. */
  query: string;
  /** Canonical `ipfs://<root>/<path>` form. */
  uri: string;
}

/** Loading lifecycle of a piece of IPFS media. */
export type IpfsMediaStatus = "loading" | "loaded" | "error";

/** A label/value pair shown in the viewer's details panel. */
export interface IpfsMediaMeta {
  label: string;
  value: string;
  /** Renders the value in a monospace face, for hashes and addresses. */
  mono?: boolean;
}

/**
 * One item in the media viewer.
 *
 * Deliberately free of any milestone or property vocabulary so the same viewer
 * serves construction evidence, title deeds and inspection reports.
 */
export interface IpfsMediaItem {
  id: string;
  /** Any reference `parseIpfsUri` accepts. */
  uri: string;
  title: string;
  /** Secondary line under the title. */
  subtitle?: string;
  /** Extra rows for the details panel. */
  meta?: IpfsMediaMeta[];
  /** Tint shown while the image loads. */
  placeholderStyle?: CSSProperties;
}
