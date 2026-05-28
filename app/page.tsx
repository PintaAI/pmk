import { getBusinessDashboard } from "@/actions/business/dashboard"
import { PempekWorkspace } from "@/components/pempek-business-app"

export const dynamic = "force-dynamic"

export default async function Home() {
  const dashboard = await getBusinessDashboard()

  return <PempekWorkspace initialDashboard={dashboard} />
}
