"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { api, ApiError, PlatformStats, SubmitResult, WriteResponse } from "@/lib/api";
import {
  accountsStore,
  removeAccount,
  setActiveAccount,
  StoredAccount,
  upsertAccount,
} from "@/lib/accounts";
import { describeError } from "@/lib/errors";

// ─── Notices ─────────────────────────────────────────────────────────

export type NoticeTone = "success" | "error" | "info";

export interface Notice {
  id: number;
  tone: NoticeTone;
  title: string;
  detail?: string;
}

// ─── Context ─────────────────────────────────────────────────────────

export type WriteOutcome<T> =
  | { mode: "simulated"; response: Extract<WriteResponse<T>, { mode: "simulated" }> }
  | { mode: "soroban"; submitted: SubmitResult };

interface AppContextValue {
  /** Null until the first `/stats` call returns. */
  stats: PlatformStats | null;
  statsError: unknown;
  /** Increments after every successful write, so views can refetch. */
  version: number;
  refresh: () => void;

  accounts: StoredAccount[];
  account: StoredAccount | null;
  selectAccount: (address: string | null) => void;
  addAccount: (account: StoredAccount) => void;
  forgetAccount: (address: string) => void;
  connectFreighter: () => Promise<void>;

  notices: Notice[];
  notify: (tone: NoticeTone, title: string, detail?: string) => void;
  dismiss: (id: number) => void;

  /**
   * Run a state-changing call. Against the simulated ledger the response is
   * the result; against deployed contracts the unsigned transaction is signed
   * with Freighter and relayed. Reports success or failure as a notice and
   * returns null on failure.
   */
  runWrite: <T>(label: string, call: () => Promise<WriteResponse<T>>) => Promise<WriteOutcome<T> | null>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside <AppProvider>");
  return value;
}

const FREIGHTER_HELP =
  "Check that the Freighter extension is installed in this browser, unlocked, and allowed to run on this site (and enabled in private windows), then try again.";

// isConnected() gives up after two seconds of silence and reports "not
// connected", which is also what an extension that has not finished attaching to
// the page looks like. Ask twice before concluding it is missing.
async function freighterResponds(freighter: typeof import("@stellar/freighter-api")): Promise<boolean> {
  if ((await freighter.isConnected()).isConnected) return true;
  await new Promise((resolve) => window.setTimeout(resolve, 800));
  return (await freighter.isConnected()).isConnected;
}

async function signWithFreighter(transaction: string, networkPassphrase: string, address: string): Promise<string> {
  const freighter = await import("@stellar/freighter-api");
  if (!(await freighterResponds(freighter))) {
    throw new Error(`Freighter did not respond. ${FREIGHTER_HELP}`);
  }
  const signed = await freighter.signTransaction(transaction, { networkPassphrase, address });
  if (signed.error) throw new Error(signed.error.message ?? "Freighter declined to sign");
  return signed.signedTxXdr;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [statsState, setStatsState] = useState<{ stats: PlatformStats | null; error: unknown }>({
    stats: null,
    error: null,
  });
  const [version, setVersion] = useState(0);
  const [notices, setNotices] = useState<Notice[]>([]);
  const nextNotice = useRef(1);

  const { accounts, active } = useSyncExternalStore(
    accountsStore.subscribe,
    accountsStore.getSnapshot,
    accountsStore.getServerSnapshot,
  );
  const account = accounts.find((a) => a.address === active) ?? null;

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    api.stats().then(
      (stats) => !cancelled && setStatsState({ stats, error: null }),
      (error) => !cancelled && setStatsState((s) => ({ stats: s.stats, error })),
    );
    return () => {
      cancelled = true;
    };
  }, [version]);

  const dismiss = useCallback((id: number) => {
    setNotices((current) => current.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (tone: NoticeTone, title: string, detail?: string) => {
      const id = nextNotice.current++;
      setNotices((current) => [...current.slice(-3), { id, tone, title, detail }]);
      window.setTimeout(() => dismiss(id), tone === "error" ? 9000 : 5000);
    },
    [dismiss],
  );

  const connectFreighter = useCallback(async () => {
    try {
      const freighter = await import("@stellar/freighter-api");
      if (!(await freighterResponds(freighter))) {
        notify("error", "Freighter did not respond", FREIGHTER_HELP);
        return;
      }
      const access = await freighter.requestAccess();
      if (access.error || !access.address) {
        notify("error", "Freighter did not share an account", access.error?.message);
        return;
      }
      upsertAccount({ address: access.address, label: "Freighter", source: "freighter" });
      notify("success", "Freighter connected");
    } catch (err) {
      notify("error", "Could not connect Freighter", describeError(err).title);
    }
  }, [notify]);

  const runWrite = useCallback(
    async <T,>(label: string, call: () => Promise<WriteResponse<T>>): Promise<WriteOutcome<T> | null> => {
      try {
        const response = await call();
        if (response.mode === "simulated") {
          notify("success", label);
          refresh();
          return { mode: "simulated", response };
        }

        // Deployed contracts: the backend prepared a transaction for `source`.
        const signer = accounts.find((a) => a.address === response.source);
        if (!signer || signer.source !== "freighter") {
          throw new Error(
            `This transaction must be signed by ${response.source}. Connect that account with Freighter.`,
          );
        }
        notify("info", `${label}: waiting for your signature`);
        const signed = await signWithFreighter(response.transaction, response.networkPassphrase, response.source);
        const submitted = await api.submitTx(signed);
        if (submitted.status === "FAILED") throw new Error(`Transaction ${submitted.hash} failed on-chain`);
        notify(
          "success",
          submitted.status === "PENDING" ? `${label}: submitted, awaiting confirmation` : label,
          `Transaction ${submitted.hash}`,
        );
        refresh();
        return { mode: "soroban", submitted };
      } catch (err) {
        const { title, detail } = describeError(err);
        notify("error", title, detail);
        if (err instanceof ApiError && err.status === 0) refresh();
        return null;
      }
    },
    [accounts, notify, refresh],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      stats: statsState.stats,
      statsError: statsState.error,
      version,
      refresh,
      accounts,
      account,
      selectAccount: setActiveAccount,
      addAccount: (a) => upsertAccount(a),
      forgetAccount: removeAccount,
      connectFreighter,
      notices,
      notify,
      dismiss,
      runWrite,
    }),
    [statsState, version, refresh, accounts, account, connectFreighter, notices, notify, dismiss, runWrite],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
