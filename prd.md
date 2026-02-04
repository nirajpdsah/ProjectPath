# 📘 Updated PRD — PERT/CPM

# Analytical Project Planning WebApp

## Product Name

**PERT-CPM Analyzer**

# 1 ⃣ Product Purpose (Based on PDF)

A web-based analytical tool that enables users to:
● Define project activities
● Define predecessor relationships
● Build AON project network
● Apply **PERT and CPM methods**
● Compute:
○ Expected activity times
○ Variances
○ ES / EF / LS / LF
○ Slack
○ Critical Path
○ Project completion time
○ Probability of meeting deadline
● Perform **project crashing (time–cost tradeoff)**
This tool follows the **six-step PERT/CPM procedure** described in the chapter.

# 2 ⃣ Scope Anchored to Textbook Model

The app must implement exactly the structured workflow from the chapter:

### Six-Step Engine Flow (Core Requirement)

1. Define project activities
2. Define predecessor relationships
3. Draw network (AON)
4. Assign time estimates


5. Compute critical path
6. Use network to monitor & control
System UI should guide users through these steps sequentially.

# 3 ⃣ Supported Methods

## CPM Mode (Deterministic)

User provides:
● Single activity duration
System computes:
● Critical path
● Schedule
● Slack

## PERT Mode (Probabilistic)

User provides:
● Optimistic (a)
● Most likely (m)
● Pessimistic (b)
System computes using textbook formulas:
Expected time:
t = (a + 4m + b) / 6
Variance:
((b − a)/6)^
Must be shown transparently in UI.


# 4 ⃣ Functional Modules

## ✅ Module A — Activity Definition (WBS Builder)

Based on PDF WBS concept.
User inputs:
● Activity ID
● Activity description
● Immediate predecessors
● Responsible person (optional — from WBS text)
● Resource note (optional — from WBS text)
Validation:
● No cycles
● No missing predecessor IDs

## ✅ Module B — Network Builder (AON Only)

The book emphasizes **Activity-On-Node (AON)** → must use AON network.
System generates:
● Start node
● Finish node
● Activity nodes
● Directed dependency arcs

## ✅ Module C — Time Estimation Engine

Supports:

### CPM

Single time value

### PERT

Three estimates → auto compute:


● Expected time
● Variance
Show formula breakdown per activity (educational requirement).

## ✅ Module D — Forward Pass Calculator

Compute:
ES = max(EF of predecessors)
EF = ES + t
System must visually show forward pass results.

## ✅ Module E — Backward Pass Calculator

Compute:
LF = min(LS of successors)
LS = LF − t
Must display backward pass table.

## ✅ Module F — Slack Calculator

Formula (from chapter):
Slack = LS − ES
Slack = LF − EF
System must show both forms.
Highlight:
● Slack > 0 → Noncritical
● Slack = 0 → Critical


## ✅ Module G — Critical Path Detector

Definition per text:
Longest time path through the network
System outputs:
● Critical path sequence
● Critical activities list
● Total project time

## ✅ Module H — Project Duration Variance (PERT Only)

System computes:
Project variance = sum of variances on critical path
Display clearly.

## ✅ Module I — Probability of Project Completion

From chapter’s probability section.
User enters deadline D.
System computes:
Z = (D − Expected Project Time) / sqrt(Project Variance)
Outputs:
● Z-score
● Probability %
● Risk status

## ✅ Module J — Project Crashing Tool

From chapter LO: reduce project time at least cost.


User inputs:
● Normal time
● Crash time
● Normal cost
● Crash cost
System computes:
● Crash slope
● Cheapest critical-path crashing order
● Time–cost tradeoff table

## ✅ Module K — Monitoring Dashboard (From Text

## Questions)

Must answer textbook control questions:
● Is project ahead/behind schedule?
● Which tasks are critical?
● Which tasks have slack?
● What activities can be delayed safely?

# 5 ⃣ User Interface Requirements

## Activity Table View

Columns:
● Activity
● Description
● Predecessors
● a, m, b (PERT mode)
● t (computed)
● Variance
● ES EF LS LF
● Slack
● Critical (Yes/No)


## Network Diagram View

```
● AON nodes
● Critical path highlighted
● Hover → show ES EF LS LF Slack
```
## Step Mode View (Educational Mode)

User can click:
● Step 1 → Define activities
● Step 2 → Dependencies
● Step 3 → Network
● Step 4 → Time estimates
● Step 5 → Critical path
● Step 6 → Control metrics

# 6 ⃣ Validation Rules (Textbook-Driven)

System must block:
● Circular dependencies
● Missing predecessor
● Negative times
● PERT missing a/m/b values
● Disconnected network

# 7 ⃣ Reports (Academic Requirement)

Exportable report includes:
● Activity table
● Network diagram
● Critical path
● Slack analysis
● Probability analysis
● Crashing analysis
PDF export required.


# 8 ⃣ Non-Functional Requirements

Performance:
● Up to 500 activities
● Recompute < 1 sec
Accuracy:
● Must match textbook formulas exactly
Reliability:
● Deterministic CPM output reproducible

# 9 ⃣ Educational Features (Based on

# Chapter Learning Objectives)

Include:
● Formula tooltips
● Step explanation
● Forward/backward pass visualization
● Slack explanation
● Critical path explanation


