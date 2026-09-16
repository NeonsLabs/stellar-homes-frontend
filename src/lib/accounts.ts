/**
 * The accounts this browser acts as, kept in localStorage.
 *
 * - `freighter`: connected through the Freighter extension, which signs.
 * - `local`: an address the person typed or generated. The simulated ledger
 *   verifies no signatures, so these are enough to walk the whole lifecycle
 *   (trustee, oracle, borrower, investor) from one browser. They cannot sign
 *   against deployed contracts.
 *
 * Exposed as an external store so React reads it with `useSyncExternalStore`
 * and the server render (which has no storage) stays consistent.
 */

export type AccountSource = "freighter" | "local";

export interface StoredAccount {
  address: string;
  label: string;
  source: AccountSource;
}

export interface AccountsState {
  accounts: StoredAccount[];
  active: string | null;
}

const KEY = "stellar-homes:accounts";
const EMPTY: AccountsState = { accounts: [], active: null };

let cached: AccountsState | null = null;
const listeners = new Set<() => void>();

function read(): AccountsState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as AccountsState;
    if (!Array.isArray(parsed.accounts)) return EMPTY;
    return { accounts: parsed.accounts, active: parsed.active ?? null };
  } catch {
    return EMPTY;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

export const accountsStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY) {
        cached = null;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot(): AccountsState {
    if (cached === null) cached = read();
    return cached;
  },
  getServerSnapshot(): AccountsState {
    return EMPTY;
  },
  update(change: (state: AccountsState) => AccountsState) {
    const next = change(accountsStore.getSnapshot());
    cached = next;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Storage can be unavailable (private windows); the session still works.
    }
    emit();
  },
};

export function upsertAccount(account: StoredAccount, activate = true) {
  accountsStore.update((state) => {
    const others = state.accounts.filter((a) => a.address !== account.address);
    return {
      accounts: [...others, account],
      active: activate ? account.address : state.active,
    };
  });
}

export function removeAccount(address: string) {
  accountsStore.update((state) => {
    const accounts = state.accounts.filter((a) => a.address !== address);
    return {
      accounts,
      active: state.active === address ? (accounts[0]?.address ?? null) : state.active,
    };
  });
}

export function setActiveAccount(address: string | null) {
  accountsStore.update((state) => ({ ...state, active: address }));
}
