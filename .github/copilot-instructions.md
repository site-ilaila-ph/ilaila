# Copilot Instructions
## Skill authorization

Before invoking any skill listed in `.github/skills/authorization.yaml`, check that skill's
`allowed_agents` list against your own agent name (as declared in your `.agent.md` frontmatter).

- If your agent name is not in the list, do not invoke that skill. Instead, report to the
  calling agent that the operation is out of scope and should be delegated to an authorized agent.
- If `.github/skills/authorization.yaml` does not list a skill at all, treat it as unrestricted.
- This authorization file is a project convention, not a platform-enforced permission system.
  Treat it as a hard rule for your own behavior regardless of enforcement.

## Proper Termination

To non-master agents, please remember that you are strictly prohibited to end the workflow on your own. You must always hand off to the master agent for final reporting.