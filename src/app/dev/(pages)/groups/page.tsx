import teamConfig, { RoleConfig } from "@/config/team";
import { Card, CardHeader, CardTitle, CardContent } from "@/lib/client/components/display/card";
import { Badge } from "@/lib/client/components/display/badge";
import { Separator } from "@/lib/client/components/layout/separator";

function assign(roleConfig: RoleConfig) {
  const features = roleConfig.features;
  const members = roleConfig.members
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .map((a) => {
      const matches =
        /([a-zA-Z\s]*[a-zA-Z]),\s([a-zA-Z\s]*[a-zA-Z])\s([a-zA-Z])\./.exec(
          a.name,
        );

      if (!matches) return a;

      return {
        ...a,
        lastName: matches[1],
        firstName: matches[2],
        middleInitial: matches[3],
      };
    })
    .map((a, i) => ({
      ...a,
      group: features[i % features.length],
    }));
    
  return Object.groupBy(members, (mem) => mem.group ?? "Unassigned");
}

export default function AssignedGroupsPage() {
  return (
    <main className="container mx-auto py-10 px-4 space-y-12 max-w-5xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Team Assignments</h1>
        <p className="text-muted-foreground">
          View assigned groups and team members categorized by role.
        </p>
      </div>

      {Object.entries(teamConfig).map(([roleName, roleConfig]) => {
        const groupedMembers = assign(roleConfig);

        return (
          <section key={roleName} className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold capitalize tracking-tight">
                {roleName}
              </h2>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groupedMembers).map(([groupName, members]) => (
                <Card key={groupName} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span>{groupName}</span>
                      <Badge variant="secondary">
                        {members?.length ?? 0} {members?.length === 1 ? "member" : "members"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <ul className="divide-y text-sm">
                      {members?.map((member, index) => (
                        <li key={index} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                          <span className="font-medium text-foreground">
                            {member.name} (@{member.github ?? 'N/A'})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}