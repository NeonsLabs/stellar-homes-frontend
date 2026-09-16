/**
 * Walks the registry to find what the contracts cannot list directly.
 *
 * The MortgagePool has no listing getter, but every live mortgage is linked
 * from its property (`mortgage_for_property`), so reading the property details
 * finds them on either ledger. Paid-off and defaulted loans are unlinked, so
 * only live ones are found this way. Fine for a registry of hundreds of
 * properties; beyond that this belongs in an indexer.
 */

import { api, MortgageDetail, PropertyDetail, PropertyStatus } from "./api";

const PAGE = 100;
const MAX_PROPERTIES = 1000;

export async function scanProperties(statuses?: PropertyStatus[]): Promise<PropertyDetail[]> {
  const ids: string[] = [];
  for (let offset = 0; offset < MAX_PROPERTIES; offset += PAGE) {
    const page = await api.properties(offset, PAGE);
    for (const p of page.properties) {
      if (!statuses || statuses.includes(p.status)) ids.push(p.id);
    }
    if (offset + PAGE >= page.total) break;
  }
  return Promise.all(ids.map((id) => api.property(id)));
}

/** Every live (applied, approved, funded or repaying) mortgage. */
export async function scanLiveMortgages(): Promise<{ mortgage: MortgageDetail; property: PropertyDetail }[]> {
  // Applied and Approved loans sit on Verified properties; the first tranche
  // marks a property Mortgaged.
  const properties = await scanProperties(["Verified", "Mortgaged"]);
  const linked = properties.filter((p) => p.mortgageId !== null);
  const mortgages = await Promise.all(linked.map((p) => api.mortgage(p.mortgageId!)));
  return mortgages.map((mortgage, i) => ({ mortgage, property: linked[i] }));
}
