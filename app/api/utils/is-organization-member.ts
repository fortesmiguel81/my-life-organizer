import { and, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { memberships } from "@/db/schema";

export async function IsOrganizationMember(orgId: string, userId: string) {
  const orgMemberships = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, userId)));

  return orgMemberships.length > 0;
}
