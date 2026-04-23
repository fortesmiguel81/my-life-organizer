import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const neonSql = neon(process.env.DATABASE_URL!);

// drizzle-orm@0.33 calls the neon client as sql(query, params, opts) — a regular
// function call. @neondatabase/serverless@1.x removed that calling style and only
// allows tagged template literals. Proxy redirects function calls to .query() which
// still accepts (text, params, opts) and is the supported replacement.
const clientProxy = new Proxy(neonSql, {
  apply(_target, _thisArg, args) {
    return (neonSql as any).query(args[0], args[1], args[2]);
  },
});

export const sql = neonSql;
export const db = drizzle(clientProxy as typeof neonSql);
