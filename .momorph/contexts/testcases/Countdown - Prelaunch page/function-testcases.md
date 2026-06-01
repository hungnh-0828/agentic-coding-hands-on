# Countdown - Prelaunch page — FUNCTION Testcases

| TC_ID | Page_Name | Category | Sub_Category | Sub_Sub_Category | Test_Objective | Precondition | Test_Data | Steps | Expected_Result | Specs | Priority | Testcase_Type | Test_Result | Executed_Date | Tester | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC_PRELAUNCH_FUN_001 | Countdown - Prelaunch page | Check state transition | Countdown | Auto update | Verify countdown units decrement over time and always show 2 digits | Prelaunch page open, event in future |  | 1. Observe units over a minute | Units update in real time, 0-padded to 2 digits | Yes | Medium | Normal_Others |  |  |  |  |
| TC_PRELAUNCH_FUN_002 | Countdown - Prelaunch page | Check branching condition | Days unit | Under one day | Verify Days shows "00" when less than 1 day remains | Less than 1 day to event |  | 1. Set/reach <1 day remaining<br>2. Observe Days unit | Days unit shows "00" | Yes | Medium | Normal_Others |  |  |  |  |
| TC_PRELAUNCH_FUN_003 | Countdown - Prelaunch page | Check business logic | Countdown units | Value ranges | Verify Hours stay within 00–23 and Minutes within 00–59 | Prelaunch page open |  | 1. Observe Hours and Minutes over time | Hours 00–23, Minutes 00–59 maintained | Yes | Low | Normal_Others |  |  |  |  |
