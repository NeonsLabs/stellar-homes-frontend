/**
 * Typed client for stellar-homes-backend.
 *
 * Shapes follow the backend's `src/present.ts`: camelCase field names, and
 * every contract integer (amounts, ids, timestamps) as a decimal string so no
 * precision is lost to JavaScript numbers. `u32` values (stages, term months,
 * rates, payment counts) arrive as plain numbers.
 */

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

/** An integer from a contract, as the API returns it. */
export type Int = string;

export type ContractName = "registry" | "lending" | "mortgage";
export type LedgerMode = "simulated" | "soroban";

// ─── Records ─────────────────────────────────────────────────────────

export type PropertyStatus = "Pending" | "Verified" | "Mortgaged" | "Repaid" | "Defaulted";

export interface Property {
  id: Int;
  trustee: string;
  titleHash: string;
  surveyDocHash: string;
  /** Zero until a surveyor publishes a valuation. */
  usdcValue: Int;
  status: PropertyStatus;
  verifiedBy: string | null;
  valuedBy: string | null;
}

export interface Milestone {
  stage: number;
  name: string;
  evidenceHash: string | null;
  verified: boolean;
  released: boolean;
  verifiedBy: string | null;
}

export interface PropertyDetail extends Property {
  milestones: Milestone[];
  verifiedStageCount: number;
  /** The live (not paid off, defaulted or declined) mortgage against it. */
  mortgageId: Int | null;
}

export type MortgageStatus = "Applied" | "Approved" | "Funded" | "Repaying" | "PaidOff" | "Defaulted";

export interface Mortgage {
  id: Int;
  propertyId: Int;
  borrower: string;
  principal: Int;
  termMonths: number;
  rateBps: number;
  status: MortgageStatus;
  disbursed: Int;
  outstanding: Int;
  interestAccrued: Int;
  interestCarry: Int;
  totalRepaid: Int;
  interestPaid: Int;
  paymentsMade: number;
  lastAccruedAt: Int;
  /** Zero until the first tranche is drawn. */
  nextPaymentDue: Int;
  createdAt: Int;
}

export interface MortgageDetail extends Mortgage {
  /** Interest brought up to date as of now, without writing anything. */
  live: {
    outstanding: Int;
    interestAccrued: Int;
    amountDue: Int;
    payoffAmount: Int;
    isDefaultable: boolean;
  };
  tranches: { stage: number; name: string; amount: Int }[];
}

export interface ScheduleRow {
  number: number;
  dueAt: Int;
  payment: Int;
  interest: Int;
  principal: Int;
  balanceAfter: Int;
}

export interface Schedule {
  mortgageId: Int;
  basis: string;
  clearsInFull: boolean;
  instalments: ScheduleRow[];
}

export interface Repayment {
  id: Int;
  amount: Int;
  principal: Int;
  interest: Int;
  timestamp: Int;
  ledger: number;
  txHash: string | null;
}

export interface Repayments {
  mortgageId: Int;
  totalRepaid: Int;
  interestPaid: Int;
  paymentsMade: number;
  /** False when RPC no longer holds every `repaid` event. */
  complete: boolean;
  repayments: Repayment[];
}

export interface PoolState {
  totalCapital: Int;
  totalReserved: Int;
  totalLent: Int;
  totalInterest: Int;
  totalWrittenOff: Int;
  totalShares: Int;
  /** Capital neither committed to an approved mortgage nor lent out. */
  available: Int;
  settlementToken: string;
  heldByPool?: Int;
}

export interface InvestorPosition {
  investor: string;
  shares: Int;
  rewardDebt: Int;
  credited: Int;
  claimableInterest: Int;
}

export interface ContractEvent {
  contract: ContractName;
  name: string;
  data: Record<string, unknown>;
  timestamp: Int;
  ledger: number;
  txHash: string | null;
}

export type KycRole = "Borrower" | "Investor" | "Trustee" | "Oracle" | "Underwriter";

export interface OnChainRoles {
  trustee: boolean;
  oracle: boolean;
  underwriter: boolean;
}

export interface UserProfile {
  address: string;
  name: string;
  kycStatus: "None" | "Pending" | "Approved" | "Rejected";
  role: KycRole;
  onChainRoles: OnChainRoles;
}

export type AuditType = "KYC" | "REGISTRY" | "LENDING" | "MORTGAGE" | "TX" | "SYSTEM";
export type EntityKind = "property" | "mortgage" | "investor";

export interface AuditEvent {
  id: number;
  type: AuditType;
  action: string;
  actor?: string;
  entityKind?: EntityKind;
  entityId?: string;
  details: string;
  timestamp: string;
}

export interface Health {
  status: string;
  service: string;
  version: string;
  network: string;
  ledger: LedgerMode;
  uptime: number;
  timestamp: string;
}

export interface PlatformStats {
  platform: string;
  network: string;
  ledger: LedgerMode;
  contracts: { propertyRegistry: string; lendingPool: string; mortgagePool: string };
  admin: string;
  rules: {
    milestones: number;
    maxLtvBps: Int;
    maxRateBps: number;
    secondsPerMonth: Int;
    graceSecs: Int;
    amountUnits: string;
  };
  /** Ledger time in seconds. Ahead of the wall clock after simulated time travel. */
  ledgerTime: Int;
  uptime: number;
  timestamp: string;
}

// ─── Writes ──────────────────────────────────────────────────────────

/** What every state-changing endpoint returns. Against the simulated ledger
 *  the call has already happened; against deployed contracts it is an
 *  unsigned transaction for `source` to sign and relay. */
export type WriteResponse<View = object> =
  | ({ mode: "simulated"; result: unknown; events: ContractEvent[] } & View)
  | { mode: "soroban"; transaction: string; networkPassphrase: string; source: string };

export interface SubmitResult {
  hash: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  ledger?: number;
  contract: ContractName;
  method: string;
  returnValue?: unknown;
}

// ─── Transport ───────────────────────────────────────────────────────

/** An error response: `{ error, message }`, plus `code` and `contract` when a
 *  contract rejected the call. */
export class ApiError extends Error {
  readonly status: number;
  readonly error: string;
  readonly code?: number;
  readonly contract?: ContractName;

  constructor(status: number, body: { error?: string; message?: string; code?: number; contract?: ContractName }) {
    super(body.message ?? body.error ?? `Request failed with status ${status}`);
    this.status = status;
    this.error = body.error ?? "RequestFailed";
    this.code = body.code;
    this.contract = body.contract;
  }
}

type Query = Record<string, string | number | undefined>;

async function request<T>(
  method: "GET" | "POST",
  path: string,
  options: { query?: Query; body?: unknown; adminKey?: string } = {},
): Promise<T> {
  const url = new URL(API_URL + path);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["content-type"] = "application/json";
  if (options.adminKey) headers["x-admin-key"] = options.adminKey;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, {
      error: "BackendUnreachable",
      message: `Cannot reach the StellarHomes backend at ${API_URL}. Is it running?`,
    });
  }

  const text = await response.text();
  let body: unknown = undefined;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = { message: text };
  }
  if (!response.ok) throw new ApiError(response.status, (body ?? {}) as object);
  return body as T;
}

const get = <T>(path: string, query?: Query) => request<T>("GET", path, { query });
const post = <T>(path: string, body: unknown, adminKey?: string) => request<T>("POST", path, { body, adminKey });

// ─── Endpoints ───────────────────────────────────────────────────────

export const api = {
  health: () => get<Health>("/health"),
  stats: () => get<PlatformStats>("/stats"),

  // KYC and roles
  verifyKyc: (body: { address: string; name: string; documentNumber: string; documentType: string; role: KycRole }) =>
    post<{ message: string; user: Omit<UserProfile, "onChainRoles"> }>("/api/kyc/verify", body),
  user: (address: string) => get<UserProfile>(`/api/users/${address}`),
  roles: (address: string) => get<OnChainRoles & { address: string }>(`/api/roles/${address}`),
  setRole: (body: { role: "trustee" | "oracle" | "underwriter"; address: string; authorized: boolean }, adminKey?: string) =>
    post<WriteResponse>("/api/admin/roles", body, adminKey),

  // PropertyRegistry
  properties: (offset = 0, limit = 100) =>
    get<{ total: number; offset: number; limit: number; properties: Property[] }>("/api/properties", { offset, limit }),
  property: (id: string) => get<PropertyDetail>(`/api/properties/${id}`),
  submitProperty: (body: { trustee: string; titleHash: string; surveyDocHash: string }) =>
    post<WriteResponse<{ property: PropertyDetail }>>("/api/properties/submit", body),
  verifyTitle: (id: string, oracle: string) =>
    post<WriteResponse<{ property: PropertyDetail }>>(`/api/properties/${id}/verify-title`, { oracle }),
  setValuation: (id: string, oracle: string, usdcValue: Int) =>
    post<WriteResponse<{ property: PropertyDetail }>>(`/api/properties/${id}/valuation`, { oracle, usdcValue }),
  submitEvidence: (id: string, body: { trustee: string; stage: number; evidenceHash: string }) =>
    post<WriteResponse<{ property: PropertyDetail }>>(`/api/properties/${id}/milestones/submit`, body),
  verifyMilestone: (id: string, oracle: string, stage: number) =>
    post<WriteResponse<{ property: PropertyDetail }>>(`/api/properties/${id}/milestones/verify`, { oracle, stage }),

  // MortgagePool
  mortgages: (query: { borrower?: string; status?: MortgageStatus } = {}) =>
    get<{ total: number; mortgages: Mortgage[] }>("/api/mortgages", query),
  mortgage: (id: string) => get<MortgageDetail>(`/api/mortgages/${id}`),
  schedule: (id: string) => get<Schedule>(`/api/mortgages/${id}/schedule`),
  repayments: (id: string) => get<Repayments>(`/api/mortgages/${id}/repayments`),
  mortgagePoolStats: () =>
    get<{ pool: Omit<PoolState, "settlementToken" | "heldByPool">; mortgages: { total: number; byStatus: Record<MortgageStatus, number> } | null }>(
      "/api/mortgages/pool/stats",
    ),
  apply: (body: { borrower: string; propertyId: string; principal: Int; termMonths: number; rateBps: number }) =>
    post<WriteResponse<{ mortgage: MortgageDetail }>>("/api/mortgages/apply", body),
  approve: (id: string, underwriter: string) =>
    post<WriteResponse<{ mortgage: MortgageDetail }>>(`/api/mortgages/${id}/approve`, { underwriter }),
  decline: (id: string, underwriter: string) => post<WriteResponse>(`/api/mortgages/${id}/decline`, { underwriter }),
  disburse: (id: string, stage: number, caller?: string) =>
    post<WriteResponse<{ mortgage: MortgageDetail }>>(`/api/mortgages/${id}/disburse`, { stage, caller }),
  repay: (id: string, borrower: string, amount: Int) =>
    post<WriteResponse<{ mortgage: MortgageDetail; message: string }>>(`/api/mortgages/${id}/repay`, { borrower, amount }),
  markDefault: (id: string, caller?: string) =>
    post<WriteResponse<{ mortgage: MortgageDetail }>>(`/api/mortgages/${id}/default`, { caller }),

  // LendingPool
  pool: () => get<PoolState>("/api/pool"),
  investor: (address: string) => get<InvestorPosition>(`/api/pool/investors/${address}`),
  deposit: (investor: string, amount: Int) =>
    post<WriteResponse<{ position: InvestorPosition }>>("/api/pool/deposit", { investor, amount }),
  withdraw: (investor: string, amount: Int) =>
    post<WriteResponse<{ position: InvestorPosition }>>("/api/pool/withdraw", { investor, amount }),
  claim: (investor: string) => post<WriteResponse<{ position: InvestorPosition }>>("/api/pool/claim", { investor }),

  // Chain
  submitTx: (transaction: string) => post<SubmitResult>("/api/tx/submit", { transaction }),
  events: (query: { contract?: ContractName; name?: string; startLedger?: number; limit?: number } = {}) =>
    get<{ total: number; events: ContractEvent[] }>("/api/events", query),
  advanceTime: (seconds: number) => post<{ ledgerTime: Int }>("/api/dev/advance-time", { seconds }),

  // Audit log
  audit: (query: { type?: AuditType; actor?: string; entityKind?: EntityKind; entityId?: string; limit?: number; offset?: number } = {}) =>
    get<{ total: number; offset: number; limit: number; events: AuditEvent[] }>("/api/audit/", query),
  auditFor: (kind: EntityKind, id: string) =>
    get<{ total: number; events: AuditEvent[] }>(`/api/audit/entity/${kind}/${encodeURIComponent(id)}`),
  auditSummary: () =>
    get<{ total: number; byType: Record<AuditType, number>; lastEvent: AuditEvent | null }>("/api/audit/summary"),
};
