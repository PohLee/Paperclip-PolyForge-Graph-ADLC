# Release process

Use after verification accepts a fixed candidate and a release is requested. This is an operational flow; the host's pipeline and any formal certification are outside this skill.

1. Pin the exact candidate, target environment, accepted verification decision, change summary, dependencies, timing, owners and affected users. Define the intended sequence, smoke checks, observation window, stop conditions, and recovery approach. Complete when the plan identifies who performs and records every step.
2. Check preflight evidence: target access, configuration and data-change order, current deployed state, health baseline, communication, and ability to recover. Mark absent evidence and hold the start if a blocking prerequisite is unknown. Complete when the operational start decision cites the plan and preflight versions.
3. Have the authorized host or human execute the release using the actual available method. Record the operator, tool or procedure, time, target, candidate version, steps, deviations and resulting deployed identity. A plan or command proposal is not execution evidence. Complete when the execution record is sourced to the observed result.
4. Run smoke checks and compare production signals with the baseline for the stated window. Record complete, request recovery, or investigate with evidence. A recovery request names the authorized operator and intended state; close it only after a later host event proves the result. On investigation, create an incident handoff. Complete when the release record links the candidate, execution, observation, disposition and follow-up.

The graph records and coordinates this process without choosing a CI/CD product or asserting deployment capability. Production access and any required approval remain host-enforced.
