import { and, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { categories, memberships } from "@/db/schema";

export async function canUserSeeCategory(categoryId: string, userId: string) {
  const [data] = await db
    .select({
      id: categories.id,
      name: categories.name,
      icon: categories.icon,
      description: categories.description,
      userId: categories.userId,
      orgId: categories.orgId,
    })
    .from(categories)
    .where(eq(categories.id, categoryId));

  if (!data) {
    return {
      canSeeCategory: false,
      data: null,
    };
  }

  const { orgId, userId: categoryUserId } = data;

  if (userId === categoryUserId) {
    return { canSeeCategory: true, data: data, error: null };
  }

  const [hasOrganizationAccess] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.orgId, orgId!)));

  return {
    canSeeCategory: hasOrganizationAccess !== null,
    data: hasOrganizationAccess !== null ? data : null,
  };
}
