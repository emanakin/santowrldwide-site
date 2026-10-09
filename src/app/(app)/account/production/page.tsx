import { redirect } from "next/navigation";

export default function ProductionAdminIndex() {
  redirect("/account/production/settings");
}
