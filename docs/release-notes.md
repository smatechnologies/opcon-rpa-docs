---
sidebar_label: "Release Notes"
title: OpCon RPA release notes
description: "Version history for OpCon RPA, with what changed in each release, why it matters, and the update considerations for each version."
tags:
  - Reference
  - System Administrator
  - RPA
---

# OpCon RPA Release Notes

## Fall 26

### 1.3.0

**Released:** TBD

**NOTE**: This release does not require an ACS Plugin DLL update, but the update is recommended. Until you update the plugin, OpCon still signs a job's RDP login user in over Remote Desktop before a Robot Task that runs in the background, including on a Background only Agent. **Do not downgrade from 1.3.0** — once 1.3.0 has started, an earlier version refuses to open the database and its service will not start. Back up the `DataCache` folder and `appsettings.json` before you update, and update antivirus, application allow-list, and monitoring rules for the renamed program files. See [Upgrade and Compatibility](#upgrade-and-compatibility-130).


#### Summary

Release 1.3.0 lets Robot Tasks that need no desktop run in the background, with nobody signed in, and adds a **Background only** Agent mode that runs the RPA Agent service without administrator rights. Existing Robot Tasks keep running in the foreground until you change them. The release also makes the Web Macro steps that write files report the failures they used to hide; fixes the Get Folders activity and wildcard matching in file masks and folder paths; lists RPA variables in the variable selector; caps the log files and lets you change the log level without a restart; renames the program files that still carried VisualCron names; and applies security updates.

#### Background Execution

##### What's New

- **CON-1527, CON-1769, CON-1770, CON-1771: Robot Tasks Run in the Background** A Robot Task built only from background-safe activities, such as most file, folder, list, variable, and flow-control activities, now runs in a host process the RPA Agent starts as the task's run-as user. No Windows session is used or created, and nobody has to be signed in on the host, including straight after a reboot. Any other activity, or Map mode playback, keeps the task in the foreground, where it runs exactly as before. The run-as user of a background run needs **Log on as a batch job** or **Allow log on locally** on the host. A background run does not log the user off or lock the workstation after the task, whatever its **After execution** settings say. For more information, see [Background and foreground execution](./robot-task-rpa.md#background-and-foreground-execution).

- **CON-1773: See and Control the Execution Mode While You Build** The **Execution Context Setup** window of a Robot Task has a new **Force foreground (always use an interactive session)** option. An indicator above the workflow designer shows which mode the task resolves to and, for the foreground, names the activity that needs the desktop. The new **Background-safe toolbox** option grays out every activity that needs a desktop. For more information, see [Check the execution mode while you build](./robot-task-rpa.md#check-the-execution-mode-while-you-build) and [Force foreground](./robot-task-rpa.md#force-foreground).

- **CON-2553: Existing Robot Tasks Stay in the Foreground** Every Robot Task saved before 1.3.0 counts as having **Force foreground** selected, so it keeps running in the foreground after the update, whatever its activities. To move a task to the background, clear the option and publish the task again. Setting `RouteBackgroundRobotTasks` to `false` in `appsettings.json` keeps every Robot Task on an Agent in the foreground. For more information, see [Tasks saved before 1.3.0](./robot-task-rpa.md#tasks-saved-before-130).

- **CON-2575: No Remote Desktop Sign-In for Background Robot Tasks** With ACS plugin 1.3.0, OpCon starts a Robot Task that will run in the background directly, with no Remote Desktop connection or sign-in, even when the job has an RDP login user. A Remote Desktop problem therefore cannot fail a task that never needed a desktop. An earlier plugin still opens the Remote Desktop connection and signs the RDP login user in first, so a Remote Desktop problem can still fail the task. For more information, see [Background Robot Tasks need no session](./rpa-unattended-session.md#background-robot-tasks-need-no-session).

- **CON-2050: Background Task Fails Clearly When Its Run-As User Cannot Log On** When the run-as user of a background task — Web Macro, Scan Document, or Robot — holds neither **Log on as a batch job** nor **Allow log on locally** on the host, the task ends **Aborted**, and its result text now names the account and both rights. Previously a Web Macro or Scan Document task in this state also ended **Aborted**, but its result text said only that the background host could not be started. For more information, see [A background task ends Aborted because its run-as user cannot log on](./troubleshooting-opcon-rpa.md#a-background-task-ends-aborted-because-its-run-as-user-cannot-log-on).

##### Why This Matters

Robot Tasks that move, read, and write files, or work through list data, no longer need a signed-in Windows session, a Remote Desktop sign-in, or a desktop to unlock and lock. With ACS plugin 1.3.0, on a host whose Robot Tasks all run in the background, no automation account has to be signed in at all. The change is opt-in per task: every existing task runs as it did until you clear **Force foreground** on it.

#### Background Only Agent Mode

##### What's New

- **CON-2602: Background Only Agent Mode** On a first install, the installer now asks for an Agent mode on its new **Agent Mode** step. **Full**, the default, runs the RPA Agent service as Local System, as every earlier version did. **Background only** runs the service, and every task, as the virtual account `NT SERVICE\RPA.Agent`, with no administrator rights. A Background only Agent runs Web Macro, Scan Document, and background Robot Tasks, refuses any task that needs a desktop or has a run-as user, and installs no credential provider at the Windows sign-in. For a silent install, pass `AGENTMODE=BackgroundOnly`. An upgrade keeps the installed mode. For more information, see [Background only Agent mode](./rpa-background-only-mode.md) and [Install the RPA Agent](./installation-opcon-rpa.md#step-4--install-the-rpa-agent).

- **CON-2614: The Task Editor on a Background Only Agent** On a Background only Agent, a task needs no Execution Context to be published, and **Force foreground** is unavailable. Saving a task there, including through **Import Settings** or **Copy**, removes its run-as user and clears **Force foreground**; the stored credential is kept. A credential is used for network access only, so its **Local login** and **Load user profile** options are unavailable. For more information, see [How the task editor behaves](./rpa-background-only-mode.md#how-the-task-editor-behaves).

- **CON-2737: A Work Folder for Task Files** A Background only install creates `C:\ProgramData\RPA\Work` and grants the service account **Modify** on it, so tasks have a place to read and write files and standard users can drop input files there. For more information, see [The work folder](./rpa-background-only-mode.md#the-work-folder).

- **CON-2736: The Agent Reports Its Mode** The Agent's `GET /api/status` endpoint returns `agentMode`, with the value `Full` or `BackgroundOnly`, so monitoring tools can tell the two apart. An Agent earlier than 1.3.0 does not return it.

##### Why This Matters

Background only lets a machine run its automation without a user account. The RPA Agent runs as a virtual account with no administrator rights, there is no Local System service and no third-party credential provider at the Windows sign-in, and the files, shares, and sites the tasks use are granted to the Agent rather than to user accounts. It suits a machine whose tasks can all run in the background. Nothing changes on an existing installation: an Agent updated from 1.2.x stays in Full mode. See [What Background only does reduce](./rpa-background-only-mode.md#what-background-only-does-reduce).

#### RPA Agent & Tray Client

##### What's New

- **CON-2630, CON-2631: Foreground Robot Tasks Get the Remote Desktop Sign-In They Need** Some Robot Tasks saved before 1.3.0, or imported from another Agent, store their run-as user in a form the readiness check did not read. For such a task with an RDP login user, OpCon skipped the Remote Desktop sign-in, and the task then failed because its user was signed out. The readiness check now reads the run-as user the same way the Agent does when it starts the task, so OpCon signs the account in first. When the run-as user of a foreground Robot Task is not signed in, the Agent now refuses the start with `RPA Client for execution user '<user>' was not found`, followed by the Tray Client sessions that are connected. Previously it accepted the start and then ended the task **Aborted** with the same message. To have OpCon sign the run-as user in before the task starts, give the task an RDP login user — see [Configure RDP login](./rpa-rdp-login.md#configure-rdp-login). For more information, see [A Robot Task fails because no RPA Client was found for its user](./troubleshooting-opcon-rpa.md#a-robot-task-fails-because-no-rpa-client-was-found-for-its-user).

- **CON-2366: Capped Log Files and a Log Level You Can Change Without a Restart** The Agent, Tray Client, and background host logs now start a new file at 50 MB as well as every day, and keep their 14 newest files. Previously a log kept up to 31 daily files of up to 1 GB each, and stopped recording for the rest of the day once its file reached 1 GB. The **RPA Agent** tab of the Tray Client's **Settings** has a new **Logging** group with a **Minimum Log Level:** list (**Information**, **Debug**, **Verbose**), which the Agent and the Tray Client apply immediately. Every log line written for a task run carries a `(task <task id>/proc <process id>)` prefix, so one run can be followed across the Agent and background host logs. Log timestamps no longer include the UTC offset. The Tray Client now records at **Information** by default instead of Debug. For more information, see [Where the logs are](./troubleshooting-opcon-rpa.md#where-the-logs-are) and [Change the log level](./troubleshooting-opcon-rpa.md#change-the-log-level).

- **CON-2366: Saving the Agent Settings Keeps Your Other Settings** Saving the Agent settings in the Tray Client now changes only the settings it shows. Previously the save rewrote `appsettings.json` and removed every setting the Tray Client does not manage, such as a configured HTTPS certificate thumbprint.

- **CON-2361: Declining a New API Token Keeps the Existing One** Selecting **Generate Token** and answering **No** to the **Key Generation Warning** now keeps the existing API token, so OpCon stays connected. Previously the existing token had already been replaced by the time the warning appeared, and the new one was discarded. A token that cannot be generated now shows `No Token Generated.` instead of closing the Tray Client.

- **CON-2758: Credential Options Saved When a Credential Is Added** The **Local login** and **Load user profile** options of a credential are now saved when the credential is first added, including credentials added through **Import Settings**. Previously they were saved only when an existing credential was updated. A credential added in an earlier version was stored with both options cleared; select them again and save the credential.

- **CON-2842: The RPA Agent Service Runs After an Update** An update could leave the RPA Agent service stopped, even though the installer finished without an error. The installer now starts the service after it removes the earlier version, so the service is running when the update finishes, including an update from 1.2.x.

- **CON-2927: Robot Task Help Opens the OpCon RPA Documentation** The in-product help link for Robot Tasks in the Tray Client opened a VisualCron page that no longer exists. It now opens the OpCon RPA [Robot Tasks](./robot-task-rpa.md) page.

##### Why This Matters

A foreground Robot Task whose run-as user is signed out gets the Remote Desktop sign-in it needs, and a start that cannot succeed is refused at once with the reason. Log folders stay within a known size, and the log level can be raised to investigate a problem and lowered again without restarting the Agent. Saving the Agent settings no longer removes settings made by hand, and declining a new API token no longer breaks the connection to OpCon. An update no longer leaves the Agent stopped until someone starts it.

#### Robot Task Activities and Variables

##### What's New

- **CON-1943, CON-2363: `#` and Character Lists in File Masks and Folder Paths** `#`, `[list]`, and `[!list]` now work in the **Folder**, **Exclude folder(s)**, and **Include file mask** fields of a file filter, in the folder fields of the **Get Folders** folder filter, and in the file name of `{FILE(Exists|<path>)}`. Previously they matched nothing there, so a mask such as `statement-####.pdf` found no files. A `[` now always starts a character list, so the mask `log[1].txt` also matches `log1.txt`. For more information, see [File and folder filters](./rpa-wildcard-matching.md#file-and-folder-filters) and [The FILE(Exists) variable](./rpa-wildcard-matching.md#the-fileexists-variable).

- **CON-2431, CON-2756: Get Folders Can Be Configured Again** The **Folder filter** window of the **Get Folders** activity failed to open, so the activity could not be used. It opens again, and its size fields are validated when you select **OK**, with messages such as `Field 'Smaller than' must be a whole number.` and `Field 'Smaller than' is too large for the selected unit.` A filter set to **OR** with only the larger-than condition selected also let every folder through; it now keeps only the folders larger than the size you set. For more information, see [Folder filters](./rpa-wildcard-matching.md#folder-filters) and [Size conditions](./rpa-wildcard-matching.md#size-conditions).

- **CON-2003: RPA Variables in the Variable Selector** In a Robot Task, the **RPA Variables** window has a new **RPA variables** section that lists the variables declared by activities in the workflow, such as the variable an activity saves its result to. Selecting one shows its `{RPA(name)}` expression, ready to copy, so you no longer type it from memory. Variables declared only by disabled activities are not listed, and variables whose names differ only by case are listed separately. For more information, see [RPA variables in a Robot task](./mapping-opcon-properties.md#rpa-variables-in-a-robot-task).

##### Why This Matters

File and folder patterns accept the same wildcards everywhere, the Get Folders activity can be used, and the variables a workflow produces can be picked from a list instead of typed by hand.

#### Web Automation

##### What's New

- **CON-2336, CON-2662: Print Page Prints** The Web Macro **Print page** step, and the Robot **Print Page** activity, silently printed nothing. They now print. A printer that saves to a file, such as Microsoft Print to PDF or Microsoft XPS Document Writer, needs the new output file setting. The Web Macro step has a **Credential:** field, like **Take screenshot** and **Download file**, for writing its output file to a network share, including in a background run. The step waits until the file is complete, and fails with a clear reason when the printer is missing, the job fails, or the file cannot be written. For more information, see [Print page](./web-macro-task.md#print-page).

- **CON-2775: Take Screenshot Fails When the File Is Not Saved** **Take screenshot** reported success even when its file could not be saved, for example because the account had no access to the folder. It now fails the step with `Could not save screenshot to '<path>': <reason>`, and the task output records whether the file was saved or skipped. For more information, see [Take screenshot](./web-macro-task.md#take-screenshot).

- **CON-2782, CON-2662: File Steps Fail When Their Credential Cannot Be Used** When the credential on a **Download file**, **Upload file**, **Extract table**, or **Save as PDF** step cannot be used, the step now fails instead of carrying on as the account the task runs as. A credential with **Local login** selected that cannot sign in fails the step with `Could not impersonate credential with id '<id>' for '<path>': <reason>`. For any other credential, a wrong password shows up as an access error on the file the step reads or writes. The **Show filtered files** preview on a file filter's **Test** tab also reports a credential that cannot be used. For more information, see [Credentials on file steps](./web-macro-task.md#credentials-on-file-steps).

- **CON-2377, CON-2920: Robot Recording with "Use web browser" Works Again** Recording a Robot Task with **Use web browser**, and the activities in the **Web Browser** section of the toolbox, failed to start in 1.2.x because the browser they open was built for an earlier version of the browser engine and could not load the one OpCon RPA ships. The browser, now `RPA.WebBrowser.exe`, is built for the shipped engine, and both work again. The browser writes its log to `C:\ProgramData\Continuous\OpCon RPAAgent\Logs\TrayClient\<username>\webbrowser_log_<yyyymmdd>.log`. The log records the size of each message the browser exchanges, not the pages a task opens or the values it types. For more information, see [Where the logs are](./troubleshooting-opcon-rpa.md#where-the-logs-are).

##### Why This Matters

A Web Macro that reports success has produced the files it was asked to write. Failures that earlier versions hid — a print that never happened, a screenshot that was never saved, a step that wrote as the wrong account — now fail the step and name the file, so a scheduled job that depends on the output finds out at the step that went wrong.

#### Upgrade and Compatibility {#upgrade-and-compatibility-130}

Read these before you update. They are covered in full in [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md#130).

- **CON-2305, CON-2377, CON-2383: Program Files Renamed** `VisualCronWebMacro.exe` is now `RPA.WebMacro.exe`, `VisualCron.WebBrowser.exe` is now `RPA.WebBrowser.exe`, and the program libraries carry `RPA.` names, such as `RPA.VisualCron.dll`. Update antivirus exclusions, application allow-lists, monitoring rules, and firewall rules that name the old files before you update the Agent; a rule that blocks unknown programs can stop Web Macro tasks from starting. Tasks saved in earlier versions still open and run.

- **CON-2553: Robot Tasks Saved Before 1.3.0 Stay in the Foreground** Nothing moves to the background on its own. See [Tasks saved before 1.3.0](./robot-task-rpa.md#tasks-saved-before-130).

- **CON-2602: Agent Mode Kept on Update** An Agent updated from 1.2.x stays in Full mode, and the update shows no mode choice. See [Change an Agent's mode](./rpa-background-only-mode.md#switch-modes).

- **Do Not Downgrade** Once 1.3.0 has started, an earlier version refuses to open the database. To go back, uninstall 1.3.0, install the earlier version, and restore the `DataCache` folder from a backup taken before the update. An installer earlier than 1.3.0 does not stop you from installing it over 1.3.0, and doing so leaves an installation whose service does not start. Starting with 1.3.0, the installer refuses to install over a newer version, with the message `A newer version of RPA Agent <version you are installing> is already installed. To install an older version, uninstall the current version first.` See [Back Up and Restore the Database](./rpa-backup-restore.md).

- **CON-1943, CON-2363: Review Masks and Folder Paths That Contain `#` or `[`** They are now matched as wildcards, so a pattern can match more than before. See [Wildcard Matching](./rpa-wildcard-matching.md).

- **CON-2336, CON-2775, CON-2782: Web Macro Steps That Write Files Can Now Fail** A **Print page** step that uses Microsoft Print to PDF or Microsoft XPS Document Writer fails until you give it an output file. A task that reported success before may now report a failure that was always there. See [Steps that write files](./web-macro-task.md#steps-that-write-files).

- **CON-2602: The Installer Shows a Setup Wizard** Earlier installers showed no wizard. An update shows a welcome step and a ready-to-install step. A silent installation with `msiexec` runs as before.

#### Security

- **CON-2543: ImageMagick Security Updates** Magick.NET, the library behind the image activities, is updated to 14.17.2, which resolves 41 ImageMagick security advisories, including memory leaks, use-after-free errors, heap buffer over-reads and over-writes, and policy bypasses, in the coders for formats such as TIFF, PSD, and DCM. Image activities are otherwise unchanged.

##### Why This Matters

Third-party components are current, keeping OpCon RPA aligned with supported and secure component versions.

## Summer 26

### 1.2.1

**Released:** 2026 September

**NOTE**: This release does not require an ACS Plugin DLL update. See [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md).


#### Summary

Release 1.2.1 fixes background Web Macro tasks being reported as failed, and starting slowly, on hosts that have a graphics driver installed. No configuration change is required.

#### Web Automation

##### What's New

- **CON-2332: Background Web Macro Task Reported as Failed Although Every Step Succeeded** A background Web Macro task could be reported as failed, with `Task Failed: OnEOCrashData`, even though the macro itself ran correctly from start to finish. Affected runs also took about a minute longer than usual. The browser was trying to use hardware-accelerated graphics in the Windows service session, which has no display to draw to; the resulting failure was recorded as an error on the task even though the browser recovered and the run completed. Background playback now uses software rendering, so the failure cannot happen. Browser startup takes about four seconds, and interactive recording and playback in the RPA Client are unchanged.

:::note Which hosts were affected
Hosts where the RPA Agent runs as a service **and** a graphics driver is installed — physical servers and workstations, and virtual machines with GPU passthrough. Virtual machines using a basic or hypervisor display adapter were not affected, because the browser already used software rendering on them.
:::

##### Why This Matters

A background Web Macro task's reported result now matches what the macro actually did. On an affected host the false failure was consistent rather than occasional, so scheduled jobs that depend on a Web Macro's exit status were failing routinely. If you had attributed those failures to the macros themselves, or built retries around them, that should no longer be necessary.

### 1.2.0

**Released:** 2026 September

**NOTE**: This release requires an ACS Plugin DLL update, and **do not downgrade from 1.2.0 to 1.1.0** — once 1.2.0 has started, 1.1.0 refuses to open the database and its service will not start. Back up the `DataCache` folder and `appsettings.json` before you update — see [Back Up and Restore the Database](./rpa-backup-restore.md). See also [Upgrade and Compatibility](#upgrade-and-compatibility) and [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md).


#### Summary

Release 1.2.0 removes the need for a signed-in user on the RPA host. Web Macro and Scan Document tasks can now run in their own host process with no interactive session and no RPA Client, and can be given their own execution user. Robot Tasks, which do drive a desktop, run in an unattended session: OpCon creates the Windows session over a Remote Desktop connection, the RPA Agent runs the task in it, and the session is signed out afterwards. The release also adds recorded-click control to the web macro recorder, corrects wildcard matching in window titles, element text, and file filters, lets you export recordings and user variables from the Agent, resolves a range of web automation, designer, and Tray Client defects, and applies security updates.

#### Background Execution

##### What's New

- **CON-2059: Web Macro and Scan Document Tasks Run Without a Session** A Web Macro or Scan Document task can now run in a host process the RPA Agent starts on demand, with no interactive Windows session and no RPA Client connected. Neither task type ever drew a user interface, so what changes is not that they became invisible — it is that they no longer need a signed-in session to live in, so they run on a host where nobody has signed in, including straight after a reboot.

- **An Execution Context for Web Macro and Scan Document tasks** The Execution Context was previously available to Robot tasks only, so these task types could not be given an identity to run as. They can now, in a credentials-only form, because the session options are meaningless without a desktop. A task therefore runs as a specific Windows account instead of inheriting whichever identity happens to be available.

**Robot tasks are not affected.** Every Robot task continues to run in an interactive session through the RPA Client, whatever its execution context.

##### Which identity a task runs as

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

##### Requirements

- Running a task as its execution user requires **Replace a process level token** and **Adjust memory quotas for a process**. The Agent service runs as Local System, which holds both inherently, so there is nothing to configure — see [Service Accounts and Permissions](./rpa-permissions.md).
- Local System is never used as the run identity for these tasks, whether asked for explicitly or reached by default. A task that would end up there fails instead.

##### Troubleshooting

Logs from the new host process are written to `%ProgramData%\Continuous\OpCon RPAAgent\Logs\HeadlessRunner\<execution user>` on the Agent machine — one folder per account a task runs as, because the host process runs as that account. The host also forwards its task log events to the Agent's own log. A task that hangs is bounded by `HeadlessTaskMaxRuntimeMinutes` in `appsettings.json`, which ships set to `60` minutes — dispatch is serial, so an unbounded hung task would stall the queue behind it. Raise the value for tasks that legitimately run longer than an hour, or set it to `0` to remove the limit entirely.

##### Why This Matters

Web Macro and Scan Document tasks can run on a host with nobody signed in, and are pinned to a specific Windows account instead of depending on who happens to be at the machine. That last part is deliberate: a background task is never run as whichever user is signed in, so an existing task needs an execution user before it will run.

#### Unattended Sessions

##### What's New

- **CON-2023: Unattended Session** Robot Tasks can now run on a host with nobody signed in and no interactive desktop already present. Before a run, OpCon asks the RPA Agent whether the task's execution user already has a usable session; when none exists, OpCon opens a Remote Desktop connection to the RPA host, signs the account in, waits for the Agent to report the user ready, and then starts the task. Configure a target host and a pool of Windows credentials on the OpCon RPA integration, set **RDP Login User (optional)** on each Robot Task, and set the After Execution Behavior to **Log off user** so no session is left standing between runs. Leaving **RDP Login User (optional)** unset keeps the previous behavior. For more information, see [Unattended Session](./rpa-unattended-session.md).

- **CON-2030: Session Sign-Out** The **Log off user** After Execution Behavior signs the session out directly, and falls back to asking the RPA Client in that session to sign itself out if it cannot — which also covers a session whose RPA Client has stopped responding. Signing out targets exactly the session that ran the task, not another session belonging to the same user. A task whose session is signed out is no longer misreported to OpCon as aborted.

- **Service account diagnostics** The Agent records which Windows account it is running as, and which of the privileges it depends on are present in its process token, in its log every time the service starts. A host in an unsupported state — the service account changed by hand, for instance — is diagnosable from the first lines of the log. The same information appears on the Agent's status endpoint.

##### Why This Matters

Robot Tasks can run on a host with nobody signed in, which removes the manual sign-in step after a reboot and removes the *need* for a standing Windows session between runs. That addresses the review finding customers raise most often: an account left continuously signed in on the RPA host. Leaving no session behind still takes configuring each task with an RDP login user and the **Log off user** After Execution Behavior. The RPA Agent service continues to run as Local System, and the installer configures it — there is nothing to choose. See [Service Accounts and Permissions](./rpa-permissions.md).

#### Web Automation

##### What's New

- **CON-2094: Choose Which Recorded Clicks Are Native Clicks** The web macro recorder now offers a **Force native clicks** option, which replays every click recorded while it is on as real mouse input rather than as a scripted click. Only a native click carries the user activation a browser requires before it will open a new tab or window. Previously the recorder decided this on its own, and it could not detect a button that opens a window from script — those clicks replayed as scripted events and silently did nothing. The option can be changed while recording, so one recording can mix the two, and the **Native click (send as real mouse input)** option on the **Action - Click** window lets you change a single recorded click without recording again. It is on for a task created in 1.2.0, so anything recorded from now on gets native clicks; a task saved before the option existed does not carry it and replays exactly as it did. With the option off, the recorder still flags a click it observes opening a new tab or window, because there is no other way to make that click work. For more information, see [Native Clicks in Web Macros](./web-macro-native-clicks.md).

- **CON-880: Browser Tab Handling in Web Recordings** Fixed tab switching and tab handling failing when a Web Macro task runs. Recording now captures closing a tab, including when a web page closes its own window. Playback now opens a new tab for pages that open in a new window, switches between tabs, and closes the tabs the recording closed — both in the designer and when the task runs unattended. Recordings created with earlier versions continue to play back correctly.

- **CON-1694: Browser Password-Save Prompt Disabled** The embedded browser no longer shows a save-password prompt during recording or playback.

##### Why This Matters

Web automation tasks can now open, switch, and close browser tabs, including pop-up windows, where earlier versions could stall outright. A click that opens a new tab or window can be recorded as one deliberately, instead of depending on what the recorder happened to observe, and a single misbehaving click can be corrected on its step rather than by recording the process again. Unattended runs are not interrupted by browser prompts.

#### Robot Designer & Tasks

##### What's New

- **CON-1723: "Log off user" After Execution Behavior** The execution context now offers **Log off user** alongside **Lock workstation** and **Do nothing**. When the task completes, RPA signs the execution context user out of Windows, ending the session and closing its applications. RPA signs a user out only when it positively identifies that user's own session; if it cannot, it takes no action and records a warning rather than sign out a different user. Because RPA cannot sign a user back in, pair it with an RDP login user so the next run signs the account in again. For more information, see [Robot Task](./robot-task-rpa.md).

- **CON-1878: Wildcard Matching for Window Titles, Element Text, and File Search** Wildcard patterns are now matched correctly wherever OpCon RPA finds something by name at runtime: the window title and element text a Robot Task activity acts on, and the folders, excluded folders, and file masks of a file or folder filter. Previously a pattern containing a wildcard character was compared literally, so it only matched a value containing that character. The supported characters are `*` (zero or more characters), `?` (exactly one character), `#` (exactly one digit), and `[list]`, `[a-z]`, and `[!list]` (one character in, in the range of, or not in a list). The full set applies to window titles, element text, and a filter's **Exclude file mask**; folder paths and the **Include file mask** are enumerated by Windows first, which recognizes only `*` and `?`, so a `#` or a `[list]` in those two fields matches nothing. Matching is not case-sensitive by default, though a file or folder filter can be set to match case, and the pattern must match the whole value. This makes an activity recorded against a caption that changes between runs — a record number, a customer name, a timestamp — reliable without recording it again. Review any existing task whose fields contain `*`, `?`, or `#`: a pattern that never matched before may now match. For more information, see [Wildcard Matching](./rpa-wildcard-matching.md).

- **CON-768, CON-641: Export Recordings from the Agent** Recordings and the user variables they depend on can be exported from the RPA Agent into a single file and imported on another machine, so you can move work to a replacement host or share a task with a colleague. Export from **Export Settings** on the Tray Client dashboard, selecting whole tasks or individual versions including drafts, and optionally protecting the file with a password. Import resolves name conflicts one task at a time, and prompts for any Windows credential the incoming tasks need — credentials are deliberately never included in the exported file. For more information, see [Importing and Exporting Tasks](./import-export-tasks-opcon-rpa.md).

- **CON-1833: Scan Document File Filter Fix** Fixed an error when opening the Scan Document action editor and an issue where its file filter settings were not saved.

- **CON-59: Clipped Text at High Display Scaling** Fixed the RPA Client and the windows it opens — the Web Macro recorder and the Robot and Scan Document designers — rendering with clipped and overlapping text at Windows display scaling above 100%. The trigger is the display scale, not the screen resolution. A scale change made while the client is running is applied the next time it starts.

- **CON-662: Job Variables Offered Where They Do Not Apply** Fixed job variables being selectable in the Set Variable and Extract Data actions.

- **CON-1095: Take Screenshot Action Error** Fixed an error returned by the **Image** > **Take Screenshot** action.

- **CON-1714: Stop Shortcut Fix** Fixed the **Ctrl+Alt+S** stop shortcut not stopping recording, element selection, or a test run.

- **CON-1742: Duplicate Credential Entry After Add** Fixed a duplicate `000` entry appearing in the credentials list after adding a credential.

- **CON-1743: Deleted Credentials Reappeared** Fixed deleted credentials reappearing in Manage Credentials.

- **CON-1834: Unhandled Exception When Closing While Recording** Fixed an unhandled exception when closing RPA while a recording was active.

- **CON-1882: SendText and Click With Duplicate Process Names** Fixed SendText and Click failing when several running processes shared the same name.

- **CON-661: Help Link Email Address** Corrected an incorrect email address in a help link.

##### Why This Matters

Tasks that must not leave a session standing can end it outright instead of only locking it. Wildcard patterns behave as documented, so an activity that depends on a caption which changes between runs can be made reliable by editing it rather than recording it again. Recordings can be moved between machines without rebuilding them. High display scaling, duplicate process names, screenshot capture, the keyboard stop shortcut, and the credentials list all behave as expected.

#### RPA Agent & Tray Client

##### What's New

- **CON-1942: Agent Startup with a Large Task Database** Fixed an issue where the RPA Agent could fail to start when the local SQLite database grew large.

- **CON-2057: Spurious "WebView already destroyed" Error** Fixed a spurious `WebView already destroyed` error failing Robot tasks that had otherwise succeeded.

- **CON-654, CON-1923, CON-2082: Remaining VisualCron References Removed** Removed the remaining VisualCron references from error messages, pop-up windows, and the descriptions on the Export Settings and Import Settings windows.

##### Why This Matters

The Agent starts reliably regardless of how much task history has accumulated, successful Robot tasks are no longer failed by a shutdown error, and the product refers to itself consistently throughout.

#### Upgrade and Compatibility

Read these before you update. They are covered in full in [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md).

- **CON-1493: Do Not Downgrade from 1.2.0 to 1.1.0** The database records which Agent version last wrote to it, and 1.2.0 stamps that record the first time it starts. From that point on, 1.1.0 refuses to open the database and the RPA Agent service will not start, reporting that the database was written by a newer Agent version. Reinstalling 1.1.0 over a 1.2.0 installation therefore leaves you with an Agent that does not run, and there is no way to convert the database back. Back up the `DataCache` folder **before** updating to 1.2.0; a pre-update backup is the only route back to 1.1.0. See [Back Up and Restore the Database](./rpa-backup-restore.md).

- **CON-2059: Give Existing Web Macro and Scan Document Tasks an Execution User** These task types now run in a host process of their own, and that process is never run as Local System or as whichever user happens to be signed in. Because the Agent service runs as Local System, an existing task with no execution user **fails after the update**, and a connected RPA Client does not rescue it. Open each such task, set an execution user, and save it. See [Which identity a task runs as](#which-identity-a-task-runs-as).

**ACS plugin update: required.** The plugin creates the Windows session for a Robot Task over a Remote Desktop connection and asks the Agent whether a session already exists.

**Service account: Local System.** The RPA Agent service runs as Local System, and the installer configures it on both a clean install and an update. There is nothing to choose and no properties to pass, including for a silent install.

#### Security

- This release includes 128 dependency security updates, addressing vulnerabilities in ImageMagick, SQLite, CoreWCF, and other third-party components.

##### Why This Matters

Third-party components are current, keeping OpCon RPA aligned with supported and secure component versions.

## Spring 26

### 1.1.0

**Released:** 2026 April

**NOTE**: This release requires an ACS Plugin DLL update. The task storage model also changed — tasks are now stored locally on the RPA Agent instead of in the OpCon Script Repository, and an OpCon user is no longer required. See [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md) for the required post-update tasks.


#### Summary

Release 1.1.0 lets OpCon RPA run independently of OpCon by moving task storage to a local database, adds Copy and Delete actions for workflows on the Draft and Archive grids, updates the ACS plugin, upgrades VisualCron to 12.3.1, and resolves Tray Client CPU, database-compatibility, error-reporting, locked-session, and OpCon task-start issues.

#### OpCon-Independent Operation

##### What's New

- **CON-459: OpCon-Independent Operation** OpCon RPA can be deployed and run without OpCon. Task storage moved to a local database, removing the dependency on the OpCon API.

##### Why This Matters

OpCon RPA can be adopted in environments that do not run OpCon, broadening where robot automation can be deployed.

#### Workflow Management

##### What's New

- **CON-69: Copy and Delete Existing Workflows** Added Copy and Delete actions on the Draft and Archive grids. Copy supports copying all versions, copying a specific version as Version 1, or copying a specific version as a draft. Per-row Delete and Run buttons are disabled while a task is running, to prevent accidental actions on a running task. Task version numbers are incremented automatically on save.

##### Why This Matters

You can duplicate and remove workflows directly from the grids, and automatic version numbering keeps task history consistent.

#### Platform & Dependencies

##### What's New

- **CON-1039: ACS Plugin Update** Updated the ACS plugin.

- **CON-1044: VisualCron Upgrade** Upgraded VisualCron from 12.2.x to 12.3.1.

- **CON-1355: Magick.NET Dependency Upgrade** Upgraded Magick.NET to 14.13.0 to resolve a vulnerable dependency.

##### Why This Matters

The ACS plugin and VisualCron engine are current, and a vulnerable image-processing dependency is removed, keeping OpCon RPA aligned with supported and secure component versions.

#### RPA Agent & Tray Client

##### What's New

- **CON-1497: Tray Client High CPU Fix** Fixed a Tray Client busy-loop that caused high CPU usage when polling the Agent for heartbeat status with no active tasks.

- **CON-1493: Database Format Compatibility Check** The Agent now detects a newer (v1.2.0) database format at startup and fails fast rather than corrupting data on a downgrade.

- **CON-716: Duplicate Tray Client Instance Prevention** Prevented starting duplicate instances of the RPA Tray Client.

- **CON-1539: Single Tray Client Instance Per User Session** Limited the Tray Client to a single instance per user session.

- **CON-1209: Script Endpoint Error Message Propagation** The normalized error message is now shown in the UI when the script endpoint returns an error.

- **CON-1541: Intermittent Task Start Failures from OpCon** Fixed an issue where reconnecting a Windows session left a stale Tray Client registration on the Agent, causing OpCon RPA jobs to fail immediately with an HTTP 400 "RPA Client ... was not found" error.

- **CON-1677: Run Jobs in a Locked Session** Fixed an issue in some environments where OpCon RPA jobs ran only while the user session was unlocked. The component needed to sign in to a locked session is now included, so jobs run when the session is locked. An active user session on the Agent is still required.

- **CON-1708: Random Error Dialog While Editing a Task** Fixed an issue where an error dialog could appear while editing a task.

##### Why This Matters

The Tray Client no longer consumes excess CPU when idle or runs as duplicate instances, the Agent protects against data corruption on downgrade, script endpoint errors surface clearly in the UI, RPA jobs run when the user session is locked in affected environments, and editing a task no longer raises spurious error dialogs.

## Winter 26

### 1.0.2

**Released:** 2026 February

**NOTE**: This release does not require an ACS Plugin DLL update. Post-update tasks are required for existing Network Credentials and Robot tasks — see [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md).


#### Summary

Release 1.0.2 introduces Desktop Session switching and Execution Context for multi-user Windows environments, fixes Network Credential password persistence and List Variable header handling, and resolves a range of Tray Client and Certificate Manager issues.

#### Execution Context & Session Management

##### What's New

- **CON-64: Desktop Session Switching and Execution Context** Single-user Windows systems can now switch between locked user sessions, and multi-user Windows server systems can direct tasks to the appropriate user session.

##### Why This Matters

OpCon RPA coverage extends to environments where multiple user sessions must be automated on the same machine, closing a gap between OpCon RPA and standard multi-user server deployments.

#### RPA Agent & Tray Client

##### What's New

- **CON-921: /api/version Session Token Requirement Removed** Endpoint `/api/version` no longer requires a session token.

- **CON-715: Start/Stop Service Button Removed from Home Screen** Removed the start/stop service button from the home screen. Use `services.msc` instead.

- **CON-650: Certificate Manager Display and Client Certificate Pass-Through** Fixed an issue where Certificate Manager did not always display available certificates correctly, and client certificates were not passed to the TaskRunner when `/api/taskProcess/startNew` was called.

##### Why This Matters

The Tray Client and RPA Agent align more closely with standard Windows service management practices, and certificate handling for TaskRunner calls is reliable.

#### Variables & Help

##### What's New

- **CON-893: List Variable Header Row Resolution Fix** Fixed an issue with the variable resolver when using List Variables like `{USERVAR(myList)}`. When the first row was specified as headers, the headers were printed as a row.

- **CON-838: Help Page Link Corrections** Corrected links for help pages.

##### Why This Matters

List Variable header handling and in-product help links behave as documented.

## Fall 25

### 1.0.1

**Released:** 2025 November

**NOTE**: This release requires an ACS Plugin DLL update to receive a bug fix where Agent status showed as available even if the Tray Client was not actually running. See [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md).


#### Summary

Release 1.0.1 introduces in-place upgrades that preserve agent settings and draft recordings, adds variable sharing between OpCon and OpCon RPA, and resolves startup, connectivity, variable, certificate, and memory issues that affected day-to-day reliability of the RPA Agent.

#### Install & Upgrade

##### What's New

- **CON-497: Install Enhancements** Customers can install enhancements and improvements to the RPA Client, enabling easier updates and better maintainability. The feature preserves existing settings on the RPA Agent and draft recordings during the upgrade process.

##### Why This Matters

In-place upgrades remove a recurring source of friction during RPA Client updates and protect work in progress.

#### Variables & Interoperability

##### What's New

- **CON-577: Sharing Variables Between Systems** Variables can be shared across systems (OpCon and OpCon RPA), improving interoperability and simplifying complex workflows.

- **CON-413: List – Load and List Create Under List Variable** Fixed an issue that prevented the use of List – Load or List Create under List Variable.

- **CON-638: OutputExpression Syntax Error Job Failure Fix** Fixed an issue where OutputExpression syntax errors caused job failure.

- **CON-652: Variable Replacer Initialization with Blank Tasks** Fixed an issue where the RPA Variable Replacer was not initialized correctly with blank tasks.

- **CON-664: User Variable Label Correction** Fixed an incorrect label when viewing user variables.

##### Why This Matters

Workflows can pass data across OpCon and OpCon RPA without external workarounds, and variable resolution, list handling, and output expression evaluation are reliable across the supported feature set.

#### RPA Agent

##### What's New

- **CON-363: Agent Start After Server Reboot with Auto-Start Enabled** Fixed an issue where the RPA Agent failed to start after a server reboot with auto-start enabled.

- **CON-378: Connectivity Reporting on OpCon Server 500 Errors** Fixed an issue where RPA incorrectly reported connectivity when the OpCon server returned a 500 error.

- **CON-484: Memory Leak Fix** Fixed a VisualCron / OpCon RPA memory leak.

- **CON-489: Store Cookies Setting Respected When Off** Fixed an issue where the RPA "Store Cookies" setting was not respected when turned off.

##### Why This Matters

Startup, connectivity, and memory regressions are resolved, increasing day-to-day reliability of the RPA Agent.

#### Settings & API Token

##### What's New

- **CON-449: Get OpCon API Token and ocadm External Password** Fixed an issue where Get OpCon API Token broke `ocadm` external password handling.

- **CON-655: Null Pointer Exception on Settings Import** Fixed a null pointer exception that occurred while importing settings.

##### Why This Matters

Settings import and the OpCon API Token handshake complete without exceptions or side effects on external passwords.
