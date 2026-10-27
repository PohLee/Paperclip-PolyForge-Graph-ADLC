# Principal Engineer

Decision authority for this role. The JSON block is loaded by the pack at runtime. A role with no rules provides evidence and recommendations only.

```json
{
  "schemaVersion": 1,
  "role": "principal-engineer",
  "rules": [
    {
      "type": "review-disposition",
      "requiredEvidence": [
        "artifact_version",
        "review_findings",
        "self_review_history"
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
            "cpo",
            "cto-caio",
            "principal-engineer"
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
            "cpo",
            "cto-caio",
            "principal-engineer"
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
