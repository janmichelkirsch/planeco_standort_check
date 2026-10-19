import "server-only";
import { cache } from "react";
import { requireSalesUser } from "@/lib/auth";
import { fetchTeamMembers } from "@/lib/dashboard-data";

/**
 * Login + Team-Mitglieder für eine Anfrage, einmal geladen und von Layout und Seite geteilt (React `cache`).
 * `me` ist die `team_members.id` des eingeloggten Nutzers (oder `null`, falls er dort fehlt).
 */
export const getSalesContext = cache(async () => {
  const user = await requireSalesUser();
  let members: Awaited<ReturnType<typeof fetchTeamMembers>> = [];
  try {
    members = await fetchTeamMembers(user.supabase);
  } catch (error) {
    console.error("[admin] Team-Mitglieder konnten nicht geladen werden", error);
  }
  const meIndex = members.findIndex((m) => m.auth_user_id === user.userId);
  if (meIndex === -1 && members.length > 0) console.error("[admin] Login ohne team_members-Eintrag");
  return {
    ...user,
    members: members.map(({ id, display_name }) => ({ id, display_name })),
    me: meIndex === -1 ? null : members[meIndex].id,
    meIndex,
    displayName: meIndex === -1 ? user.email : members[meIndex].display_name,
  };
});
