/** SWR-compatible JSON GET fetcher */
export function jsonFetcher(url) {
  return fetch(url).then((r) => r.json());
}
