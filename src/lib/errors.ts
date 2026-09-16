import { ApiError } from "./api";

/**
 * Plain-language explanations for the errors the contracts and backend raise.
 * Keyed by the error name the backend returns; see the backend's
 * `src/chain/spec.ts` for the codes.
 */
const EXPLANATIONS: Record<string, string> = {
  // Backend
  BackendUnreachable: "The StellarHomes backend is not responding.",
  InvalidRequest: "The request was not valid.",
  KycRequired: "This wallet has not completed KYC. Verify it on the KYC page first.",
  NotSigned: "The transaction was not signed by the account that must authorize it.",
  AdminKeyRequired: "A valid admin API key is required.",
  AdminDisabled: "Admin calls are disabled: the backend has no ADMIN_API_KEY set.",
  NotSupported: "This needs an indexer when running against deployed contracts.",
  NothingToSubmit: "The simulated ledger applies calls directly; there is nothing to submit.",
  HostError: "The network rejected the transaction.",
  NotFound: "Not found.",

  // Shared
  NotAuthorized: "This wallet is not authorized for that action.",
  NotInitialized: "The contract has not been initialized.",

  // PropertyRegistry
  UnknownProperty: "No property exists with that id.",
  NotTrustee: "Only the property's own registered trustee can do this.",
  NotOracle: "This wallet is not a registered oracle.",
  WrongStatus: "The record is not in a state that allows this action.",
  InvalidValuation: "The valuation must be greater than zero.",
  InvalidStage: "There are five stages, numbered 0 to 4.",
  NoEvidence: "The trustee has not submitted evidence for this stage yet.",
  AlreadyVerified: "This stage has already been signed off.",
  OutOfOrder: "Stages are signed off in order. The previous stage must be verified first.",
  MortgagePoolNotSet: "The contracts have not been wired together.",

  // LendingPool
  InsufficientShares: "You are trying to withdraw more than you deposited.",
  InsufficientAvailable: "The pool does not have that much uncommitted capital.",
  InsufficientReserved: "The pool has less capital reserved than required.",
  NothingDeposited: "This wallet has nothing deposited.",
  NothingToClaim: "There is no interest to claim yet.",

  // MortgagePool
  UnknownMortgage: "No mortgage exists with that id.",
  InvalidAmount: "The amount must be greater than zero.",
  InvalidTerm: "The term must be at least one month.",
  InvalidRate: "The rate is above the 30% cap.",
  PropertyNotVerified: "The property's title must be verified and valued first.",
  ExceedsLtv: "The loan exceeds 80% of the property's valuation.",
  NotBorrower: "Only the borrower can do this.",
  StageNotReleasable: "That stage is not signed off, or its tranche has already been released.",
  NothingToDisburse: "That stage's tranche is empty.",
  Underpaid: "The payment must cover at least the instalment due, or the full payoff.",
  NotInArrears: "The loan is not past its grace period.",
  PropertyHasMortgage: "This property already has a live mortgage.",
};

export function describeError(err: unknown): { title: string; detail?: string } {
  if (err instanceof ApiError) {
    const explanation = EXPLANATIONS[err.error];
    const source = err.contract ? ` (${err.contract} contract, error #${err.code})` : "";
    return {
      title: explanation ?? err.message,
      detail: explanation && err.message !== explanation ? `${err.error}${source}: ${err.message}` : undefined,
    };
  }
  if (err instanceof Error) return { title: err.message };
  return { title: "Something went wrong." };
}
