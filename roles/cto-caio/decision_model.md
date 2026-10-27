# CTO + CAIO

Decision authority for this role. The JSON block is loaded by the pack at runtime. A role with no rules provides evidence and recommendations only.

```json
{
  "schemaVersion": 1,
  "role": "cto-caio",
  "rules": [
    {
      "type": "technical-approach",
      "requiredEvidence": [
        "options",
        "architecture_impact",
        "risk_assessment"
      ],
      "modes": {
        "manual": {
          "allowedRoles": [
            "human-owner"
          ],
          "allowedKinds": [
            "human"
          ],
          "requiresHuman": true,
          "continueWhen": "A durable Decision Record has been written and all required evidence points to the artifact version examined.",
          "escalateWhen": "Required evidence is missing, P0/P1 risk is unresolved without permitted acceptance, or actor authority is insufficient."
        },
        "assisted": {
          "allowedRoles": [
            "cto-caio"
          ],
          "allowedKinds": [
            "agent",
            "human"
          ],
          "requiresHuman": false,
          "continueWhen": "A durable Decision Record has been written and all required evidence points to the artifact version examined.",
          "escalateWhen": "Required evidence is missing, P0/P1 risk is unresolved without permitted acceptance, or actor authority is insufficient."
        },
        "autonomous": {
          "allowedRoles": [
            "cto-caio"
          ],
          "allowedKinds": [
            "agent",
            "human"
          ],
          "requiresHuman": false,
          "continueWhen": "A durable Decision Record has been written and all required evidence points to the artifact version examined.",
          "escalateWhen": "Required evidence is missing, P0/P1 risk is unresolved without permitted acceptance, or actor authority is insufficient."
        }
      }
    },
    {
      "type": "implementation-acceptance",
      "requiredEvidence": [
        "candidate_versions",
        "independent_review",
        "test_reports"
      ],
      "modes": {
        "manual": {
          "allowedRoles": [
            "human-owner"
          ],
          "allowedKinds": [
            "human"
          ],
          "requiresHuman": true,
          "continueWhen": "A durable Decision Record has been written and all required evidence points to the artifact version examined.",
          "escalateWhen": "Required evidence is missing, P0/P1 risk is unresolved without permitted acceptance, or actor authority is insufficient."
        },
        "assisted": {
          "allowedRoles": [
            "human-owner"
          ],
          "allowedKinds": [
            "human"
          ],
          "requiresHuman": true,
          "continueWhen": "A durable Decision Record has been written and all required evidence points to the artifact version examined.",
          "escalateWhen": "Required evidence is missing, P0/P1 risk is unresolved without permitted acceptance, or actor authority is insufficient."
        },
        "autonomous": {
          "allowedRoles": [
            "cto-caio"
          ],
          "allowedKinds": [
            "agent",
            "human"
          ],
          "requiresHuman": false,
          "continueWhen": "A durable Decision Record has been written and all required evidence points to the artifact version examined.",
          "escalateWhen": "Required evidence is missing, P0/P1 risk is unresolved without permitted acceptance, or actor authority is insufficient."
        }
      }
    }
  ]
}
```
