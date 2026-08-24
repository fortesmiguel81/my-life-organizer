import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";

export async function canUserSeeCategory(categoryId: string, userId: string) {
  const [data] = await db
    .select({
      id: categories.id,
      name: categories.name,
      icon: categories.icon,
      description: categories.description,
      userId: categories.userId,
    })
    .from(categories)
    .where(eq(categories.id, categoryId));

  if (!data) {
    return {
      canSeeCategory: false,
      data: null,
    };
  }

  const canSeeCategory = userId === data.userId;

  return {
    canSeeCategory,
    data: canSeeCategory ? data : null,
  };
}
