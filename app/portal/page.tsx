// app/portal/page.tsx
"use client"

import { useBootstrap } from "@/components/shell/bootstrap-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PortalHomePage() {
  const { data, loading } = useBootstrap()

  if (loading || !data) return null

  const orgName = data.activeOrg?.name ?? "No active organization"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Portal</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Active organization: <span className="text-foreground">{orgName}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {data.roles?.length ? (
              data.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary">No roles</Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Use the navigation to access your tools
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
