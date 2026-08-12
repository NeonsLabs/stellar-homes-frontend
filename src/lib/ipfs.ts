/**
 * IPFS gateway resolver.
 *
 * Content is addressed on-chain by CID, but a browser can only fetch it over
 * HTTP through a gateway. This module turns any reference a contract, an API
 * or a person might hand us — `ipfs://…`, a bare CID, a directory path, or an
 * already-resolved gateway URL — into ordered gateway URLs to try.
 *
 * Ordering matters: public gateways rate-limit and go down, so callers walk
 * the candidate list until one responds rather than trusting a single host.
 *
 * Pure and side-effect free, so it runs identically on the server and client.
 */

import type { IpfsGateway, IpfsNamespace, ParsedIpfsUri } from "@/types/ipfs";

/**
 * Gateways in failover order.
 *
 * Subdomain gateways are preferred where the CID allows it because they give
 * each CID its own origin, so one piece of content cannot read another's
 * storage. Path gateways serve everything from a single origin, but they
 * accept every CID version, which is why one leads the list.
 */
export const IPFS_GATEWAYS: IpfsGateway[] = [
  {
    id: "ipfs-io",
    label: "ipfs.io",
    host: "ipfs.io",
    style: "path",
    operator: "IPFS Foundation",
  },
  {
    id: "dweb-link",
    label: "dweb.link",
    host: "dweb.link",
    style: "subdomain",
    operator: "Protocol Labs",
  },
  {
    id: "w3s-link",
    label: "w3s.link",
    host: "w3s.link",
    style: "subdomain",
    operator: "Storacha",
  },
  {
    id: "pinata",
    label: "gateway.pinata.cloud",
    host: "gateway.pinata.cloud",
    style: "path",
    operator: "Pinata",
  },
];

export const DEFAULT_GATEWAY_ID = IPFS_GATEWAYS[0].id;

// CIDv0 is base58btc and always starts `Qm`.
const CID_V0 = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
// CIDv1 in the multibase encodings gateways actually serve.
const CID_V1_BASE32 = /^b[a-z2-7]{20,}$/;
const CID_V1_BASE32_UPPER = /^B[A-Z2-7]{20,}$/;
const CID_V1_BASE36 = /^k[a-z0-9]{20,}$/;
const CID_V1_BASE58 = /^z[1-9A-HJ-NP-Za-km-z]{20,}$/;

/**
 * Shape-checks a CID.
 *
 * This validates the multibase prefix and alphabet only — it does not decode
 * the multihash or verify the digest, which would need a full CID library. A
 * malformed-but-plausible CID simply 404s at the gateway.
 */
export function isCid(value: string): boolean {
  if (!value) return false;
  return (
    CID_V0.test(value) ||
    CID_V1_BASE32.test(value) ||
    CID_V1_BASE32_UPPER.test(value) ||
    CID_V1_BASE36.test(value) ||
    CID_V1_BASE58.test(value)
  );
}

/**
 * Whether a CID can be placed in a gateway subdomain.
 *
 * Hostnames are case-insensitive, so only case-insensitive multibase
 * encodings survive the trip. CIDv0 is base58btc — case-sensitive — and must
 * be converted to base32 first, so it is served over path gateways instead.
 */
export function supportsSubdomainGateway(root: string): boolean {
  return CID_V1_BASE32.test(root) || CID_V1_BASE36.test(root);
}

/**
 * Normalises one path segment.
 *
 * Decoding first means an already-encoded input is not encoded twice, while a
 * raw segment containing spaces still comes out valid.
 */
function encodeSegment(segment: string): string {
  try {
    return encodeURIComponent(decodeURIComponent(segment));
  } catch {
    return encodeURIComponent(segment);
  }
}

function encodePath(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map(encodeSegment)
    .join("/");
}

/** Splits `root/some/path` into its root and remainder. */
function splitRoot(value: string): { root: string; path: string } {
  const [root, ...rest] = value.split("/");
  return { root, path: rest.join("/") };
}

function buildParsed(
  namespace: IpfsNamespace,
  root: string,
  path: string,
  query: string,
): ParsedIpfsUri | null {
  if (!root) return null;
  // IPNS names are DNS names or keys, so only CIDs get the shape check.
  if (namespace === "ipfs" && !isCid(root)) return null;

  const cleanPath = path.replace(/^\/+/, "");
  return {
    namespace,
    root,
    path: cleanPath,
    query,
    uri: `${namespace}://${root}${cleanPath ? `/${cleanPath}` : ""}`,
  };
}

/**
 * Parses any IPFS reference into its parts, or null if it is not one.
 *
 * Accepts `ipfs://cid`, `ipfs://ipfs/cid` (a common malformation), `ipns://…`,
 * a bare CID, `cid/path/file.jpg`, `https://host/ipfs/cid/…` and the
 * subdomain form `https://cid.ipfs.host/…`.
 */
export function parseIpfsUri(input: string): ParsedIpfsUri | null {
  const trimmed = (input ?? "").trim();
  if (!trimmed) return null;

  // --- Protocol form ------------------------------------------------------
  const protocolMatch = /^(ipfs|ipns):\/\/(.+)$/i.exec(trimmed);
  if (protocolMatch) {
    const namespace = protocolMatch[1].toLowerCase() as IpfsNamespace;
    // `ipfs://ipfs/<cid>` shows up in the wild; drop the duplicated segment.
    const remainder = protocolMatch[2].replace(/^(ipfs|ipns)\//i, "");
    const [withoutQuery, query = ""] = remainder.split("?");
    const { root, path } = splitRoot(withoutQuery);
    return buildParsed(namespace, root, path, query);
  }

  // --- Already-resolved HTTP gateway URL ----------------------------------
  if (/^https?:\/\//i.test(trimmed)) {
    let url: URL;
    try {
      url = new URL(trimmed);
    } catch {
      return null;
    }

    const query = url.search.replace(/^\?/, "");

    // Subdomain style: <root>.ipfs.<host>
    const subdomain = /^(.+)\.(ipfs|ipns)\./i.exec(url.hostname);
    if (subdomain) {
      const namespace = subdomain[2].toLowerCase() as IpfsNamespace;
      return buildParsed(namespace, subdomain[1], url.pathname, query);
    }

    // Path style: /ipfs/<root>/<path>
    const pathMatch = /^\/(ipfs|ipns)\/(.+)$/i.exec(url.pathname);
    if (pathMatch) {
      const namespace = pathMatch[1].toLowerCase() as IpfsNamespace;
      const { root, path } = splitRoot(pathMatch[2]);
      return buildParsed(namespace, root, path, query);
    }

    return null;
  }

  // --- Bare CID, optionally with a path -----------------------------------
  const [withoutQuery, query = ""] = trimmed.split("?");
  const { root, path } = splitRoot(withoutQuery);
  return buildParsed("ipfs", root, path, query);
}

/** True when the input is a reference this module can resolve. */
export function isIpfsReference(input: string): boolean {
  return parseIpfsUri(input) !== null;
}

/**
 * Builds the URL for one gateway, or null when that gateway cannot serve the
 * reference (a subdomain gateway asked for a CIDv0, for instance).
 */
export function buildGatewayUrl(
  parsed: ParsedIpfsUri,
  gateway: IpfsGateway,
): string | null {
  const path = encodePath(parsed.path);
  const suffix = `${path ? `/${path}` : "/"}${parsed.query ? `?${parsed.query}` : ""}`;

  if (gateway.style === "subdomain") {
    if (!supportsSubdomainGateway(parsed.root)) return null;
    return `https://${parsed.root}.${parsed.namespace}.${gateway.host}${suffix}`;
  }

  return `https://${gateway.host}/${parsed.namespace}/${parsed.root}${suffix}`;
}

/** Looks up a gateway by id. */
export function getGateway(id: string): IpfsGateway | undefined {
  return IPFS_GATEWAYS.find((gateway) => gateway.id === id);
}

/**
 * Every gateway URL worth trying for a reference, in failover order.
 *
 * `preferredGatewayId` is moved to the front, so a user's gateway choice wins
 * while still keeping the rest as fallbacks.
 */
export function getGatewayCandidates(
  input: string,
  preferredGatewayId?: string,
): string[] {
  const parsed = parseIpfsUri(input);
  if (!parsed) return [];

  const preferred = preferredGatewayId ? getGateway(preferredGatewayId) : undefined;
  const ordered = preferred
    ? [preferred, ...IPFS_GATEWAYS.filter((gateway) => gateway.id !== preferred.id)]
    : IPFS_GATEWAYS;

  return ordered
    .map((gateway) => buildGatewayUrl(parsed, gateway))
    .filter((url): url is string => url !== null);
}

/**
 * The single best URL for a reference, or null if it cannot be resolved.
 * Use `getGatewayCandidates` where failover matters.
 */
export function resolveIpfsUrl(
  input: string,
  preferredGatewayId?: string,
): string | null {
  return getGatewayCandidates(input, preferredGatewayId)[0] ?? null;
}

/** Canonical `ipfs://` form, for display and for storing on-chain. */
export function toIpfsUri(root: string, path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return `ipfs://${root}${clean ? `/${clean}` : ""}`;
}

/** Middle-truncates a CID for display: `bafybeigd…55fbzdi`. */
export function shortenCid(value: string, lead = 10, tail = 8): string {
  if (!value || value.length <= lead + tail + 1) return value;
  return `${value.slice(0, lead)}…${value.slice(-tail)}`;
}

/** Third-party CID inspector, for independently verifying a reference. */
export function cidInspectorUrl(root: string): string {
  return `https://cid.ipfs.tech/#${encodeURIComponent(root)}`;
}

/** Guesses whether a path points at an image, used to pick a renderer. */
export function looksLikeImagePath(path: string): boolean {
  return /\.(jpe?g|png|gif|webp|avif|svg|bmp)$/i.test(path);
}
