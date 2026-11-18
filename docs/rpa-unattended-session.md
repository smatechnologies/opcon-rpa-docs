---
sidebar_label: 'Unattended Session'
title: OpCon RPA unattended sessions
description: "Run foreground Robot Tasks on a host with nobody signed in — how OpCon creates the Windows session, how to secure the session afterwards, how background Robot Tasks avoid the session altogether, and how to verify the setup."
tags:
  - Procedural
  - System Administrator
  - Automation Engineer
  - RPA
hide_title: true
---

# Unattended Session

## What is it?

A Robot Task that runs in the foreground drives an interactive Windows desktop, so it needs a signed-in session to run in. Before 1.2.0 that session had to be created by a person: someone signed in on the RPA host, locked the session, and OpCon RPA unlocked it for each run. After a reboot, the host sat idle until somebody signed in again.

An **unattended session** removes the person. OpCon signs the Windows account in over a Remote Desktop connection before the task runs, the task runs in that session, and the session is signed out afterwards. Nobody has to be at the machine, and no session is left standing between runs.

A Robot Task that runs in the background, which 1.3.0 introduces, needs none of this. An unattended session is for the Robot Tasks that still need the desktop. See [Background Robot Tasks need no session](#background-robot-tasks-need-no-session).

Unattended operation combines three things, each covered on this page:

| Piece | What it does | Where you set it |
|---|---|---|
| **RDP login** | Creates the Windows session by signing the account in over Remote Desktop | The OpCon RPA integration, and each Robot Task |
| **Readiness check** | Lets OpCon ask the Agent whether a usable session already exists, so it only signs in when it has to | Automatic |
| **After Execution Behavior** | Ends the session when the task finishes | Each Robot Task's Execution Context |

## How an unattended run works

Each time OpCon starts a Robot Task that has an RDP login user and runs in the foreground, the following happens. For a task that runs in the background, see [Background Robot Tasks need no session](#background-robot-tasks-need-no-session).

1. OpCon asks the RPA Agent whether the task's execution user already has a usable session.
2. OpCon opens a Remote Desktop connection to the RPA host. If there is no usable session, it signs the account in over that connection, creating the session.
3. When it signed the account in, OpCon waits for the Agent to report that the user is ready to run tasks.
4. The Agent hands the task to the RPA Tray Client running in that session, and the task runs at that account's privilege level.
5. When the task finishes, the task's After Execution Behavior ends or secures the session.

If a usable session already exists, no sign-in happens and there is no readiness wait — the task runs in the session that is already there. The task runs only in a session that belongs to its execution user: a session another user has open is never used in its place. The Remote Desktop connection in step 2 is established either way, because a connection that has been idle stops drawing the desktop. See [What happens between runs](./rpa-rdp-login.md#what-happens-between-runs).

For the detail of the readiness answer and what OpCon does with each result, see [RDP Login](./rpa-rdp-login.md#how-a-task-run-decides-whether-to-sign-in).

## Background Robot Tasks need no session

A Robot Task that runs in the background uses no Windows session. Which tasks do, and how such a run differs, is described in [Background and foreground execution](./robot-task-rpa.md#background-and-foreground-execution).

The readiness check reports this to OpCon. With ACS plugin 1.3.0, OpCon then starts the task directly: it opens no Remote Desktop connection and signs nobody in, even when the job has an RDP login user. A Remote Desktop problem, such as an unreachable host or a wrong RDP password, therefore cannot fail a background run. The RDP login user is not checked for these runs, so a misconfigured one shows up only when a task needs the desktop.

An earlier ACS plugin still opens the Remote Desktop connection for a job that has an RDP login user, although the background task does not use it. Update the plugin, or leave **RDP Login User (optional)** empty on jobs whose task always runs in the background.

Robot Tasks saved before 1.3.0 keep running in the foreground, so they still need everything on the rest of this page. See [Tasks saved before 1.3.0](./robot-task-rpa.md#tasks-saved-before-130).

## Why run unattended

The Agent can unlock a desktop session that already exists, but it cannot create one. Without an unattended session, something else has to: either a person signs in on the host and stays signed in, or the automation accounts are left signed in with their sessions unlocked. Both leave a standing desktop per account, which is usually the first thing a security review objects to.

An unattended session removes it. OpCon opens the session for each run and the task signs it out afterwards, so between runs the host has no interactive desktop at all.

A Windows workstation edition adds a reason of its own: it supports a single interactive session, so automating more than one account on a workstation needs an RDP login user paired with **Log off user**.

## Set up an unattended session

This procedure is for a Robot Task that runs in the foreground. It assumes OpCon RPA is already installed and connected to OpCon, and that the Windows account the task runs as is allowed to sign in through Remote Desktop on the RPA host.

To set up unattended operation for a Robot Task, complete the following steps:

1. Configure RDP login on the RPA agent in Solution Manager: the target host and port, and one Windows credential per account a task runs as. For the fields and screenshots, see [Configure RDP login](./rpa-rdp-login.md#configure-rdp-login).
2. Open the Robot Task and set **RDP Login User (optional)** to the account it runs as.
3. Select **Change** under **Execution context**. In the **Execution Context Setup** window, under **After execution**, select the **Log off user** option.
4. Save and publish the task.
5. Verify it, as described in [Verify the setup](#verify-the-setup).

The next run of that task signs the account in, runs, and signs it out again.

:::note One credential per automation account
Each Windows account a task runs as needs its own entry under **Windows Login Credentials**. Use a separate account for each automated business process so that activity in the Windows event log is attributable to a single process. See [Service Accounts and Permissions](./rpa-permissions.md#what-the-automation-accounts-need).
:::

## Secure the session afterwards

An unattended run creates a signed-in Windows session. Ending it is part of the setup, not an optional extra.

| After Execution Behavior | What happens | Use when |
|---|---|---|
| **Log off user** | The session ends and its applications close. The next run signs the account in again. | Running unattended — the recommended choice |
| **Lock workstation** | The session stays running behind a lock screen. | The same user runs tasks on a schedule |
| **Do nothing** | The session is left unlocked. | Chaining tasks under the same user |

**Log off user** is the right choice for unattended work. Because OpCon signs the account back in on the next run, signing out costs you nothing between runs and leaves no standing session on the host. It also means every run starts from a fresh sign-in rather than inheriting whatever an earlier run left on the desktop — **Lock workstation** and **Do nothing** are the two settings that leave a session for the next run to reuse. See [What happens between runs](./rpa-rdp-login.md#what-happens-between-runs).

You do not have to configure how the sign-out is performed:

- An Agent running as Local System ends the session directly. This also works when the session's Tray Client has stopped responding.
- If the Agent cannot end the session itself, it asks the Tray Client in that session to sign itself out. The Tray Client acknowledges the request, waits about five seconds so its reply reaches the Agent before the session ends, and then signs out. Either route targets exactly the session that ran the task, not another session belonging to the same user.

:::note Applications can cancel a sign-out
A sign-out gives running applications the chance to save work, so an application holding an unsaved document can cancel it. Windows reports nothing when that happens, so RPA detects it by still being alive about 45 seconds later: the session keeps running and the Agent's log records that the sign-out was cancelled. Avoid leaving applications that prompt to save on an unattended host.
:::

## What runs where

An unattended session changes who creates the session, not where the task runs.

| Component | Runs as |
|---|---|
| The Remote Desktop connection that signs the account in | The OpCon RPA integration, on the OpCon side — not the RPA Agent |
| The RPA Agent service | Local System, on an Agent installed in Full mode (the default). An Agent installed in Background only mode runs no foreground tasks, so unattended sessions do not apply to it — see [Background only Agent mode](./rpa-background-only-mode.md) |
| A foreground Robot Task | The execution user, inside that user's own session, through the Tray Client in that session |
| A background Robot Task, Web Macro, or Scan Document task | The execution user, in a host process the Agent starts for the run, with no session |

Either way, the task acts with exactly the privileges of the execution user. The Agent's own privileges do not extend what a task can do.

## Verify the setup

After configuring a task, verify each piece before relying on it.

To verify unattended operation, complete the following steps:

1. Sign out every session on the RPA host, so no session exists for the execution user.
2. Run the task from OpCon.
3. Confirm the task completes successfully.
4. Confirm no session is left on the host afterwards. Run `query session` in an elevated command prompt on the host — the execution user should not be listed.
5. Run the task a second time to confirm a fresh sign-in happens each run.

To confirm the Agent is running as Local System and holds the privileges it depends on, check the first lines of the current log in `C:\ProgramData\Continuous\OpCon RPAAgent\Logs\Agent`. The Agent records its service account and the privileges present in its process token every time it starts successfully, in a line beginning `Agent identity:`.

The same information is available without opening the log, from the Agent's status endpoint: `GET https://<agent-host>:7047/api/status`, using the port from the Tray Client's **Https Url** field. The request needs the same API token that OpCon uses, as a bearer token. The response's `Capabilities` block carries the service account, whether it is Local System, and the three privileges the Agent depends on.

## Troubleshooting

| Symptom | Cause | What to do |
|---|---|---|
| The task fails to start with `RPA Client for execution user '<user>' was not found` | The task runs in the foreground, no session with a running Tray Client exists for that user, and the task has no RDP login user. The message lists the sessions that are connected, so a session belonging to a different user is easy to spot | Set **RDP Login User (optional)** on the task, or have the account signed in on the host. If the task needs no desktop, let it run in the background instead. See [Background and foreground execution](./robot-task-rpa.md#background-and-foreground-execution) |
| A Remote Desktop connection is still opened for a Robot Task that runs in the background | The ACS plugin is earlier than 1.3.0, so it does not know the task will run in the background | Update the ACS plugin, or leave **RDP Login User (optional)** empty on that job |
| The task starts but its screen captures fail with an invalid handle error | The Windows desktop in the reused session has stopped drawing | The integration re-establishes the Remote Desktop connection on every run to prevent this. Check its log that a reconnect happened before the task started; if one did and the failure persists, collect the log and contact Continuous support. See [What happens between runs](./rpa-rdp-login.md#what-happens-between-runs) |
| The task fails reporting that the desktop could not be unlocked or switched | The two Windows security policies are missing, so the Agent could not unlock the locked session left by an earlier run | Apply both policies in [Security Settings](./rpa-security-settings.md) and reboot. Setting the earlier task's After Execution Behavior to **Log off user** also avoids leaving a locked session behind |
| The Agent logs that a required privilege is not held | The service is not running as Local System, or a policy has removed a privilege it holds by default | Confirm with `sc qc RPA.Agent` that `SERVICE_START_NAME` is `LocalSystem`. Changing the account on the service's **Log On** tab is not supported |
| The session is still signed in after a task with **Log off user** | An application cancelled the sign-out, or the Tray Client was no longer connected | Check the Agent's log for the recorded reason. Remove applications that prompt to save from the unattended host |
| The task completes but OpCon reports it as aborted | — | Fixed in 1.2.0. Signing out destroys the Tray Client's registration by design, which earlier versions misread as an aborted task |

For sign-in failures, credential problems, and Remote Desktop errors, see [RDP Login](./rpa-rdp-login.md#troubleshooting). For privilege and permission errors, see [Permissions Troubleshooting](./rpa-permissions-troubleshooting.md).

## FAQs

**Do I need an unattended session for Web Macro and Scan Document tasks?**
No. Only a Robot Task drives a desktop, so only a Robot Task offers an RDP login user and an After Execution Behavior. A Web Macro or Scan Document task runs in its own host process with no interactive session, so there is no session for you to create or secure — but it does need an execution user to run as. See [Task Types](./task-types-overview.md).

**Does an unattended session require anything special from the Agent?**
No. The Agent service runs as Local System on every Full installation, which is the default, and OpCon does the work of creating the session. Nothing needs configuring on the host beyond the RDP login user on each task.

**Can I keep using desktop unlock?**
Yes. The Agent unlocks a session that is already signed in, and that continues to be supported. An unattended session is recommended rather than required — it is the only arrangement that leaves no signed-in desktop between runs.

**Who opens the Remote Desktop connection?**
The OpCon RPA integration, on the OpCon side. The RPA Agent does not open it, which is why the Agent needs no additional privileges for unattended operation.

**Is a session opened for every run?**
A Windows session is created only when one is needed: OpCon asks the Agent first, and signs the account in only when there is no usable session for the execution user. A Remote Desktop connection to the host is established on every run, however, even on runs where the session is reused. See [What happens between runs](./rpa-rdp-login.md#what-happens-between-runs).

**Why sign the user out if OpCon just signs them back in?**
So that no signed-in session is left on the host between runs. Because the next run signs the account back in automatically, there is no cost to ending it.

**Can two tasks use the same unattended account at the same time?**
Yes. Runs for the same account are serialized: the first creates the session and the rest wait for it.

**What happens after the RPA host reboots?**
Nothing needs doing. The next run of each foreground task signs its account in, and background tasks need no session at all. This is the main reason to move to unattended sessions.

## Related topics

- [RDP Login](./rpa-rdp-login.md)
- [Service Accounts and Permissions](./rpa-permissions.md)
- [Installation - OpCon RPA Agent and Netcom Relay](./installation-opcon-rpa.md)
- [Robot Task](./robot-task-rpa.md)
- [Task Types](./task-types-overview.md)
- [Background only Agent mode](./rpa-background-only-mode.md)
- [Permissions Troubleshooting](./rpa-permissions-troubleshooting.md)

## Glossary

| Term | Definition |
|------|-----------|
| Unattended session | A Windows session created by OpCon over a Remote Desktop connection so a foreground Robot Task can run with nobody signed in on the RPA host. |
| Background Robot Task | A Robot Task whose activities are all background-safe and whose **Force foreground** option is cleared. It runs in a host process as its execution user, with no Windows session. |
| Local System | `NT AUTHORITY\SYSTEM`, the built-in Windows account holding every local privilege. The account the RPA Agent service runs as on a Full installation. |
| Desktop unlock | The capability by which the RPA Agent unlocks and locks a Windows session that a person signed in to. |
| Readiness check | The question OpCon asks the RPA Agent before starting a task — whether the execution user already has a usable session, and whether the task will run in the background. |
| Execution user | The Windows account a task is configured to run as, whose session the task runs inside. |
| RDP login user | The Windows credential OpCon signs in as over Remote Desktop, chosen from the pool configured on the OpCon RPA integration. |
| After Execution Behavior | The action RPA takes after a task completes — sign the user out, lock the workstation, or leave the session unlocked. |
