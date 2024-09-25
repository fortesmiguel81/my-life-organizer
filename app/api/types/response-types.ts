import { InferResponseType } from "hono";

import { client } from "@/lib/hono";

export type TransactionsResponseType = InferResponseType<
  typeof client.api.transactions.$get,
  200
>["data"][0];

export type CategoriesResponseType = InferResponseType<
  typeof client.api.categories.$get,
  200
>["data"][0];
