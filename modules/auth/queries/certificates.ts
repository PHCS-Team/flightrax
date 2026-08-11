import { queryOptions } from "@tanstack/react-query";

import { fetchOwnCertificates } from "@/modules/auth/services/certificates.client";

export const CERTIFICATE_QUERY_KEYS = {
  all: ["auth", "certificates"] as const,
  list: ["auth", "certificates", "list"] as const,
};

export function certificatesQueryOptions() {
  return queryOptions({
    queryFn: fetchOwnCertificates,
    queryKey: CERTIFICATE_QUERY_KEYS.list,
    staleTime: 5 * 60 * 1000,
  });
}
