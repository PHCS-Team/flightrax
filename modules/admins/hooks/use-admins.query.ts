"use client";

import { useQuery } from "@tanstack/react-query";

import { adminsQueryOptions } from "@/modules/admins/queries/admins";

export function useAdmins(page: number, pageSize: number, search: string) {
  const query = useQuery(adminsQueryOptions(page, pageSize, search));

  return {
    ...query,
    admins: query.data?.data ?? [],
    totalCount: query.data?.totalCount ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    page: query.data?.page ?? page,
    pageSize: query.data?.pageSize ?? pageSize,
  };
}
