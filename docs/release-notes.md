---
sidebar_label: "Release Notes"
doc_type: conceptual
---

# OpCon RPA Release Notes

## Summer 26

### 1.2.0

**NOTE**: This release requires an ACS Plugin DLL update, and **do not downgrade from 1.2.0 to 1.1.0** — once 1.2.0 has started, 1.1.0 refuses to open the database and its service will not start. Back up the `DataCache` folder and `appsettings.json` before you update — see [Back Up and Restore the Database](./rpa-backup-restore.md). See also [Upgrade and Compatibility](#upgrade-and-compatibility) and [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md).

2026 September

# OpCon RPA Release 1.2.0 – What's New

## Summary

Release 1.2.0 removes the need for a signed-in user on the RPA host. Web Macro and Scan Document tasks can now run in their own host process with no interactive session and no RPA Client, and can be given their own execution user. Robot Tasks, which do drive a desktop, run in an unattended session: OpCon creates the Windows session over a Remote Desktop connection, the RPA Agent runs the task in it, and the session is signed out afterwards. The release also adds recorded-click control to the web macro recorder, corrects wildcard matching in window titles, element text, and file filters, lets you export recordings and user variables from the Agent, resolves a range of web automation, designer, and Tray Client defects, and applies security updates.

## Background Execution

### What's New

:eight_spoked_asterisk: **CON-2059: Web Macro and Scan Document Tasks Run Without a Session** A Web Macro or Scan Document task can now run in a host process the RPA Agent starts on demand, with no interactive Windows session and no RPA Client connected. Neither task type ever drew a user interface, so what changes is not that they became invisible — it is that they no longer need a signed-in session to live in, so they run on a host where nobody has signed in, including straight after a reboot.

:eight_spoked_asterisk: **An Execution Context for Web Macro and Scan Document tasks** The Execution Context was previously available to Robot tasks only, so these task types could not be given an identity to run as. They can now, in a credentials-only form, because the session options are meaningless without a desktop. A task therefore runs as a specific Windows account instead of inheriting whichever identity happens to be available.

**Robot tasks are not affected.** Every Robot task continues to run in an interactive session through the RPA Client, whatever its execution context.

### Which identity a task runs as

The Agent works down this ladder for each Web Macro or Scan Document task.

| The task | Runs as |
|---|---|
| Has an execution user | That user, in the new host process, signed in with a batch logon |
| Has no execution user | Nothing — the task fails. The Agent service runs as Local System, which is never used as a run identity for these tasks, and there is no fallback to the RPA Client in the signed-in session, so a connected client does not change this |

:::warning Give existing tasks an execution user before you update
An existing Web Macro or Scan Document task with no execution user **fails** after the update. Routing to the new host process is on by default, the Agent service runs as Local System which is never used as a run identity, and there is no fallback to the signed-in session — so a connected RPA Client does not rescue the task. The failure message tells you to configure an execution user on the task.

Open each such task, set an execution user, and save it — saving is what stores the value, and an earlier Agent version never stored one for these task types.
:::

:::note The run-as user's profile is loaded
A task running in the new host process is not stripped of user context. The Agent loads the run-as account's Windows profile, so the task gets that account's registry hive, `%USERPROFILE%`, `%TEMP%`, and network context rather than a default profile. What changes is *which* account provides them, not whether they exist.
:::

### Requirements

- Running a task as its execution user requires **Replace a process level token** and **Adjust memory quotas for a process**. The Agent service runs as Local System, which holds both inherently, so there is nothing to configure — see [Service Accounts and Permissions](./rpa-permissions.md).
- Local System is never used as the run identity for these tasks, whether asked for explicitly or reached by default. A task that would end up there fails instead.

### Troubleshooting

Logs from the new host process are written to `%ProgramData%\Continuous\OpCon RPAAgent\Logs\HeadlessRunner\<execution user>` on the Agent machine — one folder per account a task runs as, because the host process runs as that account. The host also forwards its task log events to the Agent's own log. A task that hangs is bounded by `HeadlessTaskMaxRuntimeMinutes` in `appsettings.json`, which ships set to `60` minutes — dispatch is serial, so an unbounded hung task would stall the queue behind it. Raise the value for tasks that legitimately run longer than an hour, or set it to `0` to remove the limit entirely.

### Why This Matters

Web Macro and Scan Document tasks can run on a host with nobody signed in, and are pinned to a specific Windows account instead of depending on who happens to be at the machine. That last part is deliberate: a background task is never run as whichever user is signed in, so an existing task needs an execution user before it will run.

## Unattended Sessions

### What's New

:eight_spoked_asterisk: **CON-2023: Unattended Session** Robot Tasks can now run on a host with nobody signed in and no interactive desktop already present. Before a run, OpCon asks the RPA Agent whether the task's execution user already has a usable session; when none exists, OpCon opens a Remote Desktop connection to the RPA host, signs the account in, waits for the Agent to report the user ready, and then starts the task. Configure a target host and a pool of Windows credentials on the OpCon RPA integration, set **RDP Login User (optional)** on each Robot Task, and set the After Execution Behavior to **Log off user** so no session is left standing between runs. Leaving **RDP Login User (optional)** unset keeps the previous behavior. For more information, see [Unattended Session](./rpa-unattended-session.md).

:eight_spoked_asterisk: **CON-2030: Session Sign-Out** The **Log off user** After Execution Behavior signs the session out directly, and falls back to asking the RPA Client in that session to sign itself out if it cannot — which also covers a session whose RPA Client has stopped responding. Signing out targets exactly the session that ran the task, not another session belonging to the same user. A task whose session is signed out is no longer misreported to OpCon as aborted.

:eight_spoked_asterisk: **Service account diagnostics** The Agent records which Windows account it is running as, and which of the privileges it depends on are present in its process token, in its log every time the service starts. A host in an unsupported state — the service account changed by hand, for instance — is diagnosable from the first lines of the log. The same information appears on the Agent's status endpoint.

### Why This Matters

Robot Tasks can run on a host with nobody signed in, which removes the manual sign-in step after a reboot and removes the *need* for a standing Windows session between runs. That addresses the review finding customers raise most often: an account left continuously signed in on the RPA host. Leaving no session behind still takes configuring each task with an RDP login user and the **Log off user** After Execution Behavior. The RPA Agent service continues to run as Local System, and the installer configures it — there is nothing to choose. See [Service Accounts and Permissions](./rpa-permissions.md).

## Web Automation

### What's New

:eight_spoked_asterisk: **CON-2094: Choose Which Recorded Clicks Are Native Clicks** The web macro recorder now offers a **Force native clicks** option, which replays every click recorded while it is on as real mouse input rather than as a scripted click. Only a native click carries the user activation a browser requires before it will open a new tab or window. Previously the recorder decided this on its own, and it could not detect a button that opens a window from script — those clicks replayed as scripted events and silently did nothing. The option can be changed while recording, so one recording can mix the two, and the **Native click (send as real mouse input)** option on the **Action - Click** window lets you change a single recorded click without recording again. It is on for a task created in 1.2.0, so anything recorded from now on gets native clicks; a task saved before the option existed does not carry it and replays exactly as it did. With the option off, the recorder still flags a click it observes opening a new tab or window, because there is no other way to make that click work. For more information, see [Native Clicks in Web Macros](./web-macro-native-clicks.md).

:white_check_mark: **CON-880: Browser Tab Handling in Web Recordings** Fixed tab switching and tab handling failing when a Web Macro task runs. Recording now captures closing a tab, including when a web page closes its own window. Playback now opens a new tab for pages that open in a new window, switches between tabs, and closes the tabs the recording closed — both in the designer and when the task runs unattended. Recordings created with earlier versions continue to play back correctly.

:white_check_mark: **CON-1694: Browser Password-Save Prompt Disabled** The embedded browser no longer shows a save-password prompt during recording or playback.

### Why This Matters

Web automation tasks can now open, switch, and close browser tabs, including pop-up windows, where earlier versions could stall outright. A click that opens a new tab or window can be recorded as one deliberately, instead of depending on what the recorder happened to observe, and a single misbehaving click can be corrected on its step rather than by recording the process again. Unattended runs are not interrupted by browser prompts.

## Robot Designer & Tasks

### What's New

:eight_spoked_asterisk: **CON-1723: "Log off user" After Execution Behavior** The execution context now offers **Log off user** alongside **Lock workstation** and **Do nothing**. When the task completes, RPA signs the execution context user out of Windows, ending the session and closing its applications. RPA signs a user out only when it positively identifies that user's own session; if it cannot, it takes no action and records a warning rather than sign out a different user. Because RPA cannot sign a user back in, pair it with an RDP login user so the next run signs the account in again. For more information, see [Robot Task](./robot-task-rpa.md).

:eight_spoked_asterisk: **CON-1878: Wildcard Matching for Window Titles, Element Text, and File Search** Wildcard patterns are now matched correctly wherever OpCon RPA finds something by name at runtime: the window title and element text a Robot Task activity acts on, and the folders, excluded folders, and file masks of a file or folder filter. Previously a pattern containing a wildcard character was compared literally, so it only matched a value containing that character. The supported characters are `*` (zero or more characters), `?` (exactly one character), `#` (exactly one digit), and `[list]`, `[a-z]`, and `[!list]` (one character in, in the range of, or not in a list). The full set applies to window titles, element text, and a filter's **Exclude file mask**; folder paths and the **Include file mask** are enumerated by Windows first, which recognizes only `*` and `?`, so a `#` or a `[list]` in those two fields matches nothing. Matching is not case-sensitive by default, though a file or folder filter can be set to match case, and the pattern must match the whole value. This makes an activity recorded against a caption that changes between runs — a record number, a customer name, a timestamp — reliable without recording it again. Review any existing task whose fields contain `*`, `?`, or `#`: a pattern that never matched before may now match. For more information, see [Wildcard Matching](./rpa-wildcard-matching.md).

:eight_spoked_asterisk: **CON-768, CON-641: Export Recordings from the Agent** Recordings and the user variables they depend on can be exported from the RPA Agent into a single file and imported on another machine, so you can move work to a replacement host or share a task with a colleague. Export from **Export Settings** on the Tray Client dashboard, selecting whole tasks or individual versions including drafts, and optionally protecting the file with a password. Import resolves name conflicts one task at a time, and prompts for any Windows credential the incoming tasks need — credentials are deliberately never included in the exported file. For more information, see [Importing and Exporting Tasks](./import-export-tasks-opcon-rpa.md).

:white_check_mark: **CON-1833: Scan Document File Filter Fix** Fixed an error when opening the Scan Document action editor and an issue where its file filter settings were not saved.

:white_check_mark: **CON-59: Clipped Text at High Display Scaling** Fixed the RPA Client and the windows it opens — the Web Macro recorder and the Robot and Scan Document designers — rendering with clipped and overlapping text at Windows display scaling above 100%. The trigger is the display scale, not the screen resolution. A scale change made while the client is running is applied the next time it starts.

:white_check_mark: **CON-662: Job Variables Offered Where They Do Not Apply** Fixed job variables being selectable in the Set Variable and Extract Data actions.

:white_check_mark: **CON-1095: Take Screenshot Action Error** Fixed an error returned by the **Image** > **Take Screenshot** action.

:white_check_mark: **CON-1714: Stop Shortcut Fix** Fixed the **Ctrl+Alt+S** stop shortcut not stopping recording, element selection, or a test run.

:white_check_mark: **CON-1742: Duplicate Credential Entry After Add** Fixed a duplicate `000` entry appearing in the credentials list after adding a credential.

:white_check_mark: **CON-1743: Deleted Credentials Reappeared** Fixed deleted credentials reappearing in Manage Credentials.

:white_check_mark: **CON-1834: Unhandled Exception When Closing While Recording** Fixed an unhandled exception when closing RPA while a recording was active.

:white_check_mark: **CON-1882: SendText and Click With Duplicate Process Names** Fixed SendText and Click failing when several running processes shared the same name.

:white_check_mark: **CON-661: Help Link Email Address** Corrected an incorrect email address in a help link.

### Why This Matters

Tasks that must not leave a session standing can end it outright instead of only locking it. Wildcard patterns behave as documented, so an activity that depends on a caption which changes between runs can be made reliable by editing it rather than recording it again. Recordings can be moved between machines without rebuilding them. High display scaling, duplicate process names, screenshot capture, the keyboard stop shortcut, and the credentials list all behave as expected.

## RPA Agent & Tray Client

### What's New

:white_check_mark: **CON-1942: Agent Startup with a Large Task Database** Fixed an issue where the RPA Agent could fail to start when the local SQLite database grew large.

:white_check_mark: **CON-2057: Spurious "WebView already destroyed" Error** Fixed a spurious `WebView already destroyed` error failing Robot tasks that had otherwise succeeded.

:white_check_mark: **CON-654, CON-1923, CON-2082: Remaining VisualCron References Removed** Removed the remaining VisualCron references from error messages, pop-up windows, and the descriptions on the Export Settings and Import Settings windows.

### Why This Matters

The Agent starts reliably regardless of how much task history has accumulated, successful Robot tasks are no longer failed by a shutdown error, and the product refers to itself consistently throughout.

## Upgrade and Compatibility

Read these before you update. They are covered in full in [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md).

:warning: **CON-1493: Do Not Downgrade from 1.2.0 to 1.1.0** The database records which Agent version last wrote to it, and 1.2.0 stamps that record the first time it starts. From that point on, 1.1.0 refuses to open the database and the RPA Agent service will not start, reporting that the database was written by a newer Agent version. Reinstalling 1.1.0 over a 1.2.0 installation therefore leaves you with an Agent that does not run, and there is no way to convert the database back. Back up the `DataCache` folder **before** updating to 1.2.0; a pre-update backup is the only route back to 1.1.0. See [Back Up and Restore the Database](./rpa-backup-restore.md).

:warning: **CON-2059: Give Existing Web Macro and Scan Document Tasks an Execution User** These task types now run in a host process of their own, and that process is never run as Local System or as whichever user happens to be signed in. Because the Agent service runs as Local System, an existing task with no execution user **fails after the update**, and a connected RPA Client does not rescue it. Open each such task, set an execution user, and save it. See [Which identity a task runs as](#which-identity-a-task-runs-as).

**ACS plugin update: required.** The plugin creates the Windows session for a Robot Task over a Remote Desktop connection and asks the Agent whether a session already exists.

**Service account: Local System.** The RPA Agent service runs as Local System, and the installer configures it on both a clean install and an update. There is nothing to choose and no properties to pass, including for a silent install.

## Security

:white_check_mark: This release includes 128 dependency security updates, addressing vulnerabilities in ImageMagick, SQLite, CoreWCF, and other third-party components.

### Why This Matters

Third-party components are current, keeping OpCon RPA aligned with supported and secure component versions.

## Spring 26

### 1.1.0

**NOTE**: This release requires an ACS Plugin DLL update. The task storage model also changed — tasks are now stored locally on the RPA Agent instead of in the OpCon Script Repository, and an OpCon user is no longer required. See [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md) for the required post-update tasks.

2026 April

# OpCon RPA Release 1.1.0 – What's New

## Summary

Release 1.1.0 lets OpCon RPA run independently of OpCon by moving task storage to a local database, adds Copy and Delete actions for workflows on the Draft and Archive grids, updates the ACS plugin, upgrades VisualCron to 12.3.1, and resolves Tray Client CPU, database-compatibility, error-reporting, locked-session, and OpCon task-start issues.

## OpCon-Independent Operation

### What's New

:eight_spoked_asterisk: **CON-459: OpCon-Independent Operation** OpCon RPA can be deployed and run without OpCon. Task storage moved to a local database, removing the dependency on the OpCon API.

### Why This Matters

OpCon RPA can be adopted in environments that do not run OpCon, broadening where robot automation can be deployed.

## Workflow Management

### What's New

:eight_spoked_asterisk: **CON-69: Copy and Delete Existing Workflows** Added Copy and Delete actions on the Draft and Archive grids. Copy supports copying all versions, copying a specific version as Version 1, or copying a specific version as a draft. Per-row Delete and Run buttons are disabled while a task is running, to prevent accidental actions on a running task. Task version numbers are incremented automatically on save.

### Why This Matters

You can duplicate and remove workflows directly from the grids, and automatic version numbering keeps task history consistent.

## Platform & Dependencies

### What's New

:eight_spoked_asterisk: **CON-1039: ACS Plugin Update** Updated the ACS plugin.

:eight_spoked_asterisk: **CON-1044: VisualCron Upgrade** Upgraded VisualCron from 12.2.x to 12.3.1.

:white_check_mark: **CON-1355: Magick.NET Dependency Upgrade** Upgraded Magick.NET to 14.13.0 to resolve a vulnerable dependency.

### Why This Matters

The ACS plugin and VisualCron engine are current, and a vulnerable image-processing dependency is removed, keeping OpCon RPA aligned with supported and secure component versions.

## RPA Agent & Tray Client

### What's New

:white_check_mark: **CON-1497: Tray Client High CPU Fix** Fixed a Tray Client busy-loop that caused high CPU usage when polling the Agent for heartbeat status with no active tasks.

:white_check_mark: **CON-1493: Database Format Compatibility Check** The Agent now detects a newer (v1.2.0) database format at startup and fails fast rather than corrupting data on a downgrade.

:white_check_mark: **CON-716: Duplicate Tray Client Instance Prevention** Prevented starting duplicate instances of the RPA Tray Client.

:white_check_mark: **CON-1539: Single Tray Client Instance Per User Session** Limited the Tray Client to a single instance per user session.

:white_check_mark: **CON-1209: Script Endpoint Error Message Propagation** The normalized error message is now shown in the UI when the script endpoint returns an error.

:white_check_mark: **CON-1541: Intermittent Task Start Failures from OpCon** Fixed an issue where reconnecting a Windows session left a stale Tray Client registration on the Agent, causing OpCon RPA jobs to fail immediately with an HTTP 400 "RPA Client ... was not found" error.

:white_check_mark: **CON-1677: Run Jobs in a Locked Session** Fixed an issue in some environments where OpCon RPA jobs ran only while the user session was unlocked. The component needed to sign in to a locked session is now included, so jobs run when the session is locked. An active user session on the Agent is still required.

:white_check_mark: **CON-1708: Random Error Dialog While Editing a Task** Fixed an issue where an error dialog could appear while editing a task.

### Why This Matters

The Tray Client no longer consumes excess CPU when idle or runs as duplicate instances, the Agent protects against data corruption on downgrade, script endpoint errors surface clearly in the UI, RPA jobs run when the user session is locked in affected environments, and editing a task no longer raises spurious error dialogs.

## Winter 26

### 1.0.2

**NOTE**: This release does not require an ACS Plugin DLL update. Post-update tasks are required for existing Network Credentials and Robot tasks — see [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md).

2026 February

# OpCon RPA Release 1.0.2 – What's New

## Summary

Release 1.0.2 introduces Desktop Session switching and Execution Context for multi-user Windows environments, fixes Network Credential password persistence and List Variable header handling, and resolves a range of Tray Client and Certificate Manager issues.

## Execution Context & Session Management

### What's New

:eight_spoked_asterisk: **CON-64: Desktop Session Switching and Execution Context** Single-user Windows systems can now switch between locked user sessions, and multi-user Windows server systems can direct tasks to the appropriate user session.

### Why This Matters

OpCon RPA coverage extends to environments where multiple user sessions must be automated on the same machine, closing a gap between OpCon RPA and standard multi-user server deployments.

## RPA Agent & Tray Client

### What's New

:white_check_mark: **CON-921: /api/version Session Token Requirement Removed** Endpoint `/api/version` no longer requires a session token.

:white_check_mark: **CON-715: Start/Stop Service Button Removed from Home Screen** Removed the start/stop service button from the home screen. Use `services.msc` instead.

:white_check_mark: **CON-650: Certificate Manager Display and Client Certificate Pass-Through** Fixed an issue where Certificate Manager did not always display available certificates correctly, and client certificates were not passed to the TaskRunner when `/api/taskProcess/startNew` was called.

### Why This Matters

The Tray Client and RPA Agent align more closely with standard Windows service management practices, and certificate handling for TaskRunner calls is reliable.

## Variables & Help

### What's New

:white_check_mark: **CON-893: List Variable Header Row Resolution Fix** Fixed an issue with the variable resolver when using List Variables like `{USERVAR(myList)}`. When the first row was specified as headers, the headers were printed as a row.

:white_check_mark: **CON-838: Help Page Link Corrections** Corrected links for help pages.

### Why This Matters

List Variable header handling and in-product help links behave as documented.

## Fall 25

### 1.0.1

**NOTE**: This release requires an ACS Plugin DLL update to receive a bug fix where Agent status showed as available even if the Tray Client was not actually running. See [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md).

2025 November

# OpCon RPA Release 1.0.1 – What's New

## Summary

Release 1.0.1 introduces in-place upgrades that preserve agent settings and draft recordings, adds variable sharing between OpCon and OpCon RPA, and resolves startup, connectivity, variable, certificate, and memory issues that affected day-to-day reliability of the RPA Agent.

## Install & Upgrade

### What's New

:eight_spoked_asterisk: **CON-497: Install Enhancements** Customers can install enhancements and improvements to the RPA Client, enabling easier updates and better maintainability. The feature preserves existing settings on the RPA Agent and draft recordings during the upgrade process.

### Why This Matters

In-place upgrades remove a recurring source of friction during RPA Client updates and protect work in progress.

## Variables & Interoperability

### What's New

:eight_spoked_asterisk: **CON-577: Sharing Variables Between Systems** Variables can be shared across systems (OpCon and OpCon RPA), improving interoperability and simplifying complex workflows.

:white_check_mark: **CON-413: List – Load and List Create Under List Variable** Fixed an issue that prevented the use of List – Load or List Create under List Variable.

:white_check_mark: **CON-638: OutputExpression Syntax Error Job Failure Fix** Fixed an issue where OutputExpression syntax errors caused job failure.

:white_check_mark: **CON-652: Variable Replacer Initialization with Blank Tasks** Fixed an issue where the RPA Variable Replacer was not initialized correctly with blank tasks.

:white_check_mark: **CON-664: User Variable Label Correction** Fixed an incorrect label when viewing user variables.

### Why This Matters

Workflows can pass data across OpCon and OpCon RPA without external workarounds, and variable resolution, list handling, and output expression evaluation are reliable across the supported feature set.

## RPA Agent

### What's New

:white_check_mark: **CON-363: Agent Start After Server Reboot with Auto-Start Enabled** Fixed an issue where the RPA Agent failed to start after a server reboot with auto-start enabled.

:white_check_mark: **CON-378: Connectivity Reporting on OpCon Server 500 Errors** Fixed an issue where RPA incorrectly reported connectivity when the OpCon server returned a 500 error.

:white_check_mark: **CON-484: Memory Leak Fix** Fixed a VisualCron / OpCon RPA memory leak.

:white_check_mark: **CON-489: Store Cookies Setting Respected When Off** Fixed an issue where the RPA "Store Cookies" setting was not respected when turned off.

### Why This Matters

Startup, connectivity, and memory regressions are resolved, increasing day-to-day reliability of the RPA Agent.

## Settings & API Token

### What's New

:white_check_mark: **CON-449: Get OpCon API Token and ocadm External Password** Fixed an issue where Get OpCon API Token broke `ocadm` external password handling.

:white_check_mark: **CON-655: Null Pointer Exception on Settings Import** Fixed a null pointer exception that occurred while importing settings.

### Why This Matters

Settings import and the OpCon API Token handshake complete without exceptions or side effects on external passwords.
