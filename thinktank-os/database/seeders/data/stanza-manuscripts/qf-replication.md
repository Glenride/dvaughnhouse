# A Replication of "A Flexible Design for Funding Public Goods"

**Author:** D'Vaughn House (Glenride)
**Date:** November 6, 2026
**Status:** Independent replication study — manuscript for the STANZA / License It From Anywhere catalog

## Authorship note

This manuscript is an independent numerical replication, authored by D'Vaughn House.
The work being replicated — Buterin, Hitzig, and Weyl, "A Flexible Design for Funding
Public Goods," arXiv:1809.06421v2 (August 2020) — is by Vitalik Buterin, Zoë Hitzig,
and E. Glen Weyl. That paper is cited throughout as the source of the mechanisms,
definitions, and propositions verified here. It is not claimed as the author's work.
Licensing this manuscript licenses this replication study, not the original paper.

## Abstract

We reconstruct, in code, every mechanism in Buterin, Hitzig, and Weyl (2020) —
private contributions, one-person-one-vote, quadratic finance (QF), deficit-aware QF,
capital-constrained QF (CQF), signed (±) QF, the β-norm family, and the dynamic
assurance contract — and verify Propositions 1–5 and the worked collusion examples
of Section 5.2 numerically. The paper states its results for arbitrary smooth,
increasing, strictly concave valuations; we instantiate the parametric testbed
V_i(F) = 2·θ_i·√F, for which the social optimum is F* = (Σθ_i)² and V′(F*) = 1.
All nine verification targets match the paper's claims: private contributions
underfund by a factor of N in the homogeneous case (V′ = 10 at N = 10); 1p1v
funds at the median rather than the mean (F = 25 vs. F* = 225 in the skewed case);
QF attains the optimum exactly (F^QF = F* = 400, V′ = 1); deficit financing gives
V′ → 1 + Λ; CQF gives V′ → 1/α; the Sybil and cartel arithmetic on page 19
reproduces exactly (40x on 20x; +$801 defection gain); signed QF attains the
optimum (F = 64, V′ = 1); the β-family underfunds for β < 2, is optimal at β = 2,
and overfunds for β > 2; and the assurance contract escapes the F = 0 cold-start
trap (F* = 58.58 > 50). Full provenance, code, and run records are in the
replication harness (`buterin_2020_qf/`: `code/mechanisms.py`,
`code/run_all_targets.py`, seed 202607).

## 1. Testbed

Valuation: V_i(F) = θ_i · 2√F, so V_i′(F) = θ_i/√F — smooth, increasing, and
strictly concave for F > 0. Social optimum (Definition 2 of the original):
V′(F*) = Σθ_i/√F* = 1, hence F* = (Σθ_i)².

## 2. Results

### 2.1 Proposition 1 — Private contributions are suboptimal (Sec. 3.4)

Homogeneous citizens (N = 10, θ_i = 1): F* = 100, but Φ^priv yields
F^priv = 1.0 and V′(F^priv) = 10.0 = N — funding is 1/N² of optimal.
Heterogeneous citizens (θ = [1, 2, 3, 4, 10], F* = 400): only the
highest-valuation citizen contributes (c₅ = 100, c₁..₄ = 0), with
V₅′ = 1.0 and total V′ = 2.0 > 1.

### 2.2 Proposition 2 — 1p1v is suboptimal (Sec. 3.4)

Skewed preferences (θ = [1, 1, 1, 1, 11], median 1.0, mean 3.0):
Φ^1p1v sets F = (5 × 1)² = 25.0 instead of F* = 225.0, giving V′ = 3.0 > 1.

### 2.3 Proposition 3 — QF is optimal (Sec. 4.1–4.3)

With θ = [1, 2, 3, 4, 10], contributions c_i = θ_i² yield
F^QF = (Σθ_i)² = 400.0 = F* and V′ = 1.0, with first-order-condition error 0.0.
All four Section 4.3 properties hold: homogeneity of degree 1, N_c² community
scaling, split-halving ratio 0.5, and single-contributor reversion
(error 2.84×10⁻¹⁴, floating-point roundoff).

### 2.4 Deficit financing (Sec. 4.5, Eqs. 14–15)

The identity V′(F) − Λ = 1 − Σλ_j√c_j / Σ√c_j holds to 1.11×10⁻¹⁶.
With symmetric shadow costs λ_i = Λ/N and Λ = 1.0, V′(F) = 1 + Λ − Λ/N:
1.9000 at N = 10, converging to 1.9990 at N = 1000 toward 1 + Λ = 2.0.

### 2.5 CQF — Propositions 4 and 5 (Sec. 5.1)

Marginal impact ∂Φ^CQF/∂c_i = α·Σ√c_j/√c_i + 1 − α exceeds 1 strictly
(minimum 1.90 at α = 0.1 with equal contributions). At M = 1000, α = 0.1,
exact CQF equilibrium gives V′ = 9.9108, within 0.89% of the asymptotic
1/α = 10.0.

### 2.6 Sybil fraud and cartel defection (Sec. 5.2, p. 19)

At α = 0.1, one citizen splitting into 20 identities contributing x each
pays 20x and receives 0.1·(20√x)² = 40x — a 2.0× payout; the minimum
profitable fraud size is 1/α = 10. A 100-member cartel at $1,000 each is
funded at $1,000,000 ($10,000 per member, $9,000 net). One defector lowers
funding to $980,100, keeps $9,801 with $0 cost — a net gain of exactly $801.

### 2.7 Signed (±) QF (Sec. 5.3, Def. 8, Eqs. 20–21)

For θ = [4, 3, 3, −2] (Σθ = 8), positive contributors choose +1 and the
negative contributor −1, yielding F^±QF = (4 + 3 + 3 − 2)² = 64.0 = F* and
V′ = 1.0, with Eq. (21) holding per citizen at 0.0 error.

### 2.8 The β-norm family (Sec. 5.4, Eqs. 22–25)

For θ = [1, 2, 3, 4] (F* = 100), Eq. (25) Σ(V_j′)^{1/(β−1)} = 1 holds to
≤ 2.22×10⁻¹⁶ across β ∈ {1.25, 1.5, 2.0, 3.0}:

| β | F^β | V′(F^β) | Regime |
|---|-----|---------|--------|
| 1.25 | 18.81 | 2.3054 | Underfunded |
| 1.50 | 30.00 | 1.8257 | Underfunded |
| 2.00 | 100.00 | 1.0000 | Optimal |
| 3.00 | 1427.07 | 0.2647 | Overfunded |

### 2.9 Assurance contracts (Sec. 5.5)

With S-shaped valuations (threshold 50.0), total marginal value at F = 0 is
1.04×10⁻⁹ ≪ 1, so simultaneous play is trapped at F = 0. A conditional
assurance contract reaches the interior optimum F* = 58.58 > 50.0, with
+14.21 net surplus per citizen and +89.39 total social welfare.

## 3. Conclusion

The paper's mechanism claims verify numerically, including its exact
collusion arithmetic. The replication also corrects two small points in the
draft record: the β-family and assurance-contract values above are the ones
the code actually computes, and two "0.0" errors in the draft were
floating-point roundoff (Eq. 15: 1.11×10⁻¹⁶; single-contributor reversion:
2.84×10⁻¹⁴). None of the paper's conclusions change.

## References

Buterin, V., Hitzig, Z., & Weyl, E. G. (2020). A Flexible Design for Funding
Public Goods. arXiv:1809.06421v2. https://arxiv.org/abs/1809.06421
