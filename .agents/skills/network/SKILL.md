---

name: network

description: Guidance for network architecture design and read-only diagnosis of connectivity, routing, DNS, segmentation, firewall, and policy problems.

---

# Networking

Use this skill for:

* network architecture and topology
* IP addressing and subnetting
* VLANs and segmentation
* routing
* WAN and site connectivity
* DNS
* firewall and ACL behavior
* connectivity and packet-loss diagnosis
* network migration planning
* management and observability design

Network work is either **design** or **diagnosis**.

Do not make live configuration changes through this skill.

## Design

When designing a network:

### Requirements

Identify the requirements that materially affect the design, such as:

* users/devices/sites
* critical applications
* security or compliance requirements
* availability target
* existing infrastructure
* budget constraints
* migration/cutover tolerance

Do not invent requirements that were not provided. State important assumptions explicitly.

### Architecture

Choose the simplest topology that satisfies the requirements.

Prefer:

* routed boundaries over unnecessary Layer-2 extension
* explicit segmentation for management, servers, users, guests, IoT, and sensitive workloads
* clear routing domains
* least-privilege traffic paths
* redundancy where availability requirements justify it

Do not introduce BGP, OSPF, EVPN, SD-WAN, microsegmentation, or other advanced mechanisms unless the requirements justify them.

### Addressing and segmentation

Define:

* address ranges
* subnets/VLANs
* routing boundaries
* intended traffic flows
* management-plane access

Make security boundaries explicit.

### Management and observability

Include appropriate:

* management access
* logging
* monitoring
* configuration backup
* alerting
* recovery/rollback procedures

Treat these as part of the architecture rather than optional additions.

### Hardware

Avoid recommending specific hardware models unless a vendor or procurement standard is already established.

Instead specify:

* capacity
* port requirements
* redundancy
* required features
* performance expectations

### Implementation

For migrations or new deployments, provide phases with:

* implementation action
* validation gate
* rollback point

Identify residual risks and missing evidence.

## Diagnosis

Use evidence-driven diagnosis rather than guessing.

### 1. Characterize the symptom

Determine:

* what fails
* who is affected
* where it fails
* when it started
* whether it is intermittent
* what changed recently

### 2. Establish a starting layer

Start at the most likely layer and move only when evidence requires it.

### Layer 1 / Layer 2

Check, where applicable:

* interface/link state
* VLAN membership
* spanning-tree state
* error counters
* duplex/speed negotiation

Look for:

* link failures
* CRC/errors
* duplex mismatches
* incorrect VLAN assignment
* blocked spanning-tree paths

### Layer 3

Check:

* routing tables
* next hops
* source-specific reachability
* default routes
* asymmetric paths
* stale or missing routes

Verify reachability from the relevant source rather than assuming the device itself is representative.

### DNS

Compare:

* local resolver behavior
* known-good resolver behavior
* authoritative answers where appropriate

Distinguish DNS resolution failures from routing or application connectivity failures.

Consider:

* resolver configuration
* DHCP-provided DNS settings
* local zones
* forwarding
* firewall/policy behavior

### Firewall / Policy

Use read-only:

* counters
* logs
* policy matches
* connection/session information

Never disable a firewall rule, ACL, authentication mechanism, or management restriction merely to test a hypothesis.

A matching deny should lead to a narrow proposed remediation, not a blanket policy bypass.

### Evidence

For each conclusion, identify the evidence that:

* supports the suspected cause
* rules out plausible alternatives

The suspected root cause should explain the complete symptom set, not just one symptom.

## Safe Remediation

Separate **diagnosis** from **remediation**.

State clearly when an action would change system state.

Never execute a state-changing network command without explicit confirmation.

Prefer narrow remediation over broad policy changes.

## Output

For architecture work, structure the result around:

* Objective
* Assumptions
* Recommended topology
* Addressing and segmentation
* Routing and connectivity
* Management and observability
* Implementation phases
* Risks and mitigations

For diagnosis, structure the result around:

* Symptom and affected scope
* Starting layer
* Evidence gathered
* Likely root cause
* Recommended remediation
* Verification plan
* Residual risk

## Guardrails

* Prefer evidence over guesses.
* Do not weaken security controls for testing.
* Do not expose credentials, keys, secrets, or sensitive configuration.
* Do not claim a diagnosis is confirmed when the available evidence only supports a hypothesis.
* Do not make live configuration changes through this skill.

## Goal

Design networks that are:

**simple, segmented, observable, resilient, and appropriate to the requirements.**

Diagnose network problems with:

## **evidence first, minimal assumptions, and safe remediation.**
