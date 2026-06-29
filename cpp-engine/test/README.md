# Regression Test Suite Documentation

This test suite evaluates structural integrity, constraints handling, error validation paths, and traversal metrics of the Seating Allocation Engine without altering underlying engine behaviors.

## Test Case Reference Matrix

| File Name | Expected Result | Target Feature / Purpose |
| :--- | :--- | :--- |
| `input_small.json` | **Succeeds** | Basic pipeline validation with minimal footprints (2x2 grid setup). |
| `input_medium.json` | **Succeeds** | Validates multi-classroom allocations under completely balanced section patterns. |
| `input_large.json` | **Succeeds** | Production load emulation testing 220 units mapped over 5 distinct venues. |
| `input_single_section.json` | **Succeeds** | Validates consecutive placement fallback policies when variance drops to 0. |
| `input_unbalanced_sections.json` | **Succeeds** | Stress-tests conflict cooling heuristics and priority queue weight balancing loops. |
| `input_capacity_overflow.json` | **Fails (`INSUFFICIENT_CAPACITY`)** | Confirms capacity validation loops halt processing before initiating map loops. |
| `input_duplicate_students.json` | **Fails (Validation Error)** | Asserts duplicate index uniqueness protection boundaries reject identical keys. |
| `input_invalid_room.json` | **Fails (Validation Error)** | Boundary detection checking for multi-dimensional coordinate bounds ($\le 0$). |
| `input_empty_students.json` | **Fails (Validation Error)** | Checks initialization guardrails for processing empty array instances. |
| `input_empty_rooms.json` | **Fails (Validation Error)** | Ensures safe rejection bounds if allocation targeting arrays are empty. |
| `input_multiple_rooms.json` | **Succeeds** | Validates transition rules and distribution curves across diverse grid shapes. |
| `input_checkerboard.json` | **Succeeds** | Evaluates spatial optimization and scoring for Checkerboard index configurations. |
| `input_snake.json` | **Succeeds** | Verifies horizontal-reversing coordinate indices specific to Snake traversal paths. |
| `input_spiral.json` | **Succeeds** | Assesses outward-inward perimeter compression bounds for Spiral pattern systems. |
| `input_centerout.json` | **Succeeds** | Confirms high-density focal tracking rules for Center-Out location generators. |

## Data Contract Restrictions
All JSON fixtures comply natively with the strict structural boundaries:
* Objects utilize exclusively `"departmentCode"` (No raw legacy strings).
* Targets arrays are fixed globally to `"rooms"` arrays.
* Structural metadata values like general capacity entries have been entirely isolated outside transmission interfaces.
