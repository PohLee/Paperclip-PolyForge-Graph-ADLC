# Code delivery evidence

Use for the optional code-delivery graph.

1. Pin candidate, repository, PR URL, full head SHA, required checks and approval count from host policy. Obtain fresh observations through authorized repository tools.
2. Collect checks, eligible approvals, independent review, findings and mergeability for that head. Use `pack.policyDocuments.evidenceContracts` for the output. A changed head requires a new run.
3. Choose ready only after all conditions pass. Hold on pending checks, failures, missing access or uncertain observations. Record merged only from a sourced event naming the reviewed head and merge commit.
4. Complete with the Graph decision and linked report. Release still requires its separate human authorization and host execution event.
