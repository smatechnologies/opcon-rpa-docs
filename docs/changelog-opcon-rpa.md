---
sidebar_label: 'Change Log'
---

# Change Log 
### 1.0.2 (February 2026)

#### 1. Features Introduced
Desktop Session switching and Execution Context (__CON-64__). Added ability for single-user windows systems to switch between locked user sessions.
Added ability for multi-user windows server systems to direct tasks to appropriate user session.

#### 2. Bug Fixes

- __CON-921__ - Endpoint /api/version no longer requires a session token.
- __CON-893__ - Fixed issue with variable resolver when using List Variables like `{USERVAR(myList)}`, and the first row was specified to be headers, caused headers to be printed as a row.
- __CON-838__ - Corrected links for help pages
- __CON-715__ - Removed star/stop service button from home screen. Use services.msc instead.
- __CON-650__ - Fixed issue where Certificate Manager wasn't always displaying available certificates correctly and client certificates were not getting passed to the TaskRunner when /api/taskProcess/startNew was called.

### 1.0.1 (November 2025)

#### 1. Features Introduced
Install Enhancements (__CON-497__)
Customers can now install enhancements and improvements to the RPA Client, enabling easier updates and better maintainability. This feature allows customers to preserve all existing settings on the RPA Agent as well as draft recordings during the upgrade process.

Sharing Variables Between Systems (__CON-577__)
Added functionality to share variables across systems (OpCon and OpCon RPA), improving interoperability and simplifying complex workflows.

#### 2. Bug Fixes
The following issues have been resolved in this release:

- __CON-363__ – RPA Agent fails to start after server reboot with auto-start enabled
- __CON-378__ – RPA incorrectly reports connectivity when OpCon server returns 500 error
- __CON-413__ – Unable to use List – Load or List Create under List Variable
- __CON-449__ – Get OpCon API Token breaks ocadm external password
- __CON-484__ – VisualCron/OpCon RPA memory leak issue
- __CON-489__ – RPA "Store Cookies" setting not respected when off
- __CON-638__ – OutputExpression syntax errors cause job failure
- __CON-652__ – RPA Variable Replacer not initialized with blank tasks correctly
- __CON-655__ – Null pointer exception while importing settings
- __CON-664__ – Incorrect label when viewing user variables
