# Homepage SAA — ACCESSING Testcases

| TC_ID | Page_Name | Category | Sub_Category | Sub_Sub_Category | Test_Objective | Precondition | Test_Data | Steps | Expected_Result | Specs | Priority | Testcase_Type | Test_Result | Executed_Date | Tester | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC_HOME_ACC_001 | Homepage SAA | Check authentication | Homepage | Authenticated landing | Verify authenticated user lands on Homepage with logged-in header controls | User logged in via Google |  | 1. Log in<br>2. Observe redirect | Homepage SAA shown with profile/notification/language controls | Yes | High | Access control and security |  |  |  |  |
| TC_HOME_ACC_002 | Homepage SAA | Check access permission | Profile menu | Admin role option | Verify "Admin Dashboard" appears in profile menu only for admin role | Logged in | Admin user; non-admin user | 1. Open profile menu as admin<br>2. Open profile menu as non-admin | Admin sees "Admin Dashboard"; non-admin does not | Yes | High | Access control and security |  |  |  |  |
