---
sidebar_label: 'Permissions Troubleshooting'
title: OpCon RPA permissions troubleshooting
description: "A support-oriented reference for OpCon RPA permission and session problems: which component holds which privilege, what each error message means, what to collect before escalating, and how to answer a security review."
tags:
  - Reference
  - Operations Staff
  - System Administrator
  - RPA
hide_title: true
---

# Permissions Troubleshooting

## What is it?

Most OpCon RPA cases that look like a permissions problem are really one of four things: the Agent service does not hold a privilege it needs, the automation account has no session to run in, a Windows security policy was never applied, or the customer is asking why RPA needs elevated rights at all.

This page maps symptoms to those causes. Use it alongside [Service Accounts and Permissions](./rpa-permissions.md), which explains the model in full.

## The model in one table

Answer most privilege questions from this table before opening logs.

| Component | Runs as | Needs | Does not need |
|---|---|---|---|
| **RPA Agent service** | Local System (`NT AUTHORITY\SYSTEM`) on an Agent installed in Full mode, the default. An Agent installed in Background only mode runs as `NT SERVICE\RPA.Agent` instead — see [Background only Agent mode](./rpa-background-only-mode.md) | Nothing on a Full mode Agent. Local System already holds every local privilege, so the installer grants no rights and no folder permissions | Domain rights: as Local System it presents the computer account on the network, so it can reach no network resource as a user |
| **RPA Tray Client** | The signed-in user | Only what that user already has. It requests no elevation. | Local administrator rights |
| **Automation account** | Itself — in its own session for a foreground Robot Task, or in a host process the Agent starts for a background task | Only the rights the applications it drives require. For a background task, also **Log on as a batch job** or **Allow log on locally** on the host | Local administrator rights |
| **Installer and security policies** | An administrator, once | Local administrator rights | Anything ongoing. Setup only. |

The single most common misunderstanding: **the automation does not run elevated.** Only the service that prepares the session is privileged, and it runs no automation.

## Fast triage

Work down this list. Each step rules out a layer.

1. Confirm the **RPA Agent** service is running, and note the account in the **Log On As** column of Windows Services.
2. For a Robot Task that runs in the foreground, confirm the automation account has a session on the host and its Tray Client is connected. For a background task, confirm the account holds **Log on as a batch job** or **Allow log on locally** on the host instead; it needs no session.
3. Confirm both security policies are applied. See [Security Settings](./rpa-security-settings.md).
4. Open the current Agent log — `C:\ProgramData\Continuous\OpCon RPAAgent\Logs\Agent\log<yyyymmdd>.txt`, one file per day — and find the entry for the failed run. For the other components' logs, see [Where the logs are](./troubleshooting-opcon-rpa.md#where-the-logs-are).
5. Match the message against [Error message reference](#error-message-reference).

## Error message reference

These strings appear in the Agent log. The message is the fastest route to the cause.

### The task never starts

| Message | Cause | Resolution |
|---|---|---|
| `RPA Client for execution user '<user>' was not found` | The task runs in the foreground, and the automation account has no session on the host or its Tray Client is not connected to the Agent. A session belonging to another user is never used instead; the message lists the sessions that are connected | Sign the account in — the session may be left locked, since the Agent unlocks it — or give the task an RDP login user. See [RDP Login](./rpa-rdp-login.md). If the task needs no desktop, it can run in the background instead — see [Background and foreground execution](./robot-task-rpa.md#background-and-foreground-execution). |
| `Failed to launch headless runner host: LogonUser failed for both batch and interactive logon: '<user>' holds neither 'Log on as a batch job' nor 'Allow log on locally'…` | A background task's run-as user holds neither logon right on the host, or a Deny policy overrides them. The task ends **Aborted** | Grant the account **Log on as a batch job** in Local Security Policy, and check the Deny policies. See [A background task ends Aborted because its run-as user cannot log on](./troubleshooting-opcon-rpa.md#a-background-task-ends-aborted-because-its-run-as-user-cannot-log-on). |
| `Credential provider->Credential provider was not installed.` — appended to an unlock or login failure | The OpCon RPA credential provider is not registered on the host | Repair or reinstall the Agent. The installer registers `InteractiveLogonCPx64.dll` in `C:\Windows\System32` on every Full install, so its absence means the install is damaged rather than misconfigured. |
| `Task has no execution context, so there is no identity to run it as…` | A Web Macro or Scan Document task has no stored execution user. Those task types run in a host process of their own, which is never run as Local System and never as whichever user happens to be signed in | Open the task, set an execution user, and save it — saving is what stores the value, and an earlier Agent version never stored one for these task types. A connected Tray Client does not satisfy this. |
| `Task {TaskId} XML does not contain ExecutionContext element` | The task was published without an execution context | Open the task, set an execution context, and publish again. |
| `Failed to parse ExecutionContext from task {TaskId} XML` | The task's stored execution context is malformed | Reopen the execution context, reselect the user, and publish again. |

### The session will not unlock or switch

| Message | Cause | Resolution |
|---|---|---|
| `Failed to unlock/switch desktop for user` | Most often the two security policies are missing | Apply both policies in [Security Settings](./rpa-security-settings.md) and reboot. Then confirm the service is running as Local System with `sc qc RPA.Agent` — unlocking is restricted to Local System, so an account changed by hand cannot do it. |
| `Unlock failed for user ... Attempting fallback method (UnlockEx)` | The primary unlock path failed and a fallback is in progress | Not itself a failure. Treat it as a warning unless the fallback also fails. |
| `Fallback unlock method (UnlockEx) also failed for user` | Both unlock paths failed | Apply the policies, reboot, and confirm the account's password stored in RPA is current. |
| `Operation timed out: Login` | The sign-in did not complete in time | Check host load. Confirm the stored password is current — an incorrect password presents as a timeout. |
| `Timeout waiting for active user ... to lock session` | Another user's session did not lock in time | Expected when a person is at the machine. Use **Lock other session** for hands-off runs. |
| `Could not find a session for user ... and there are {count} active sessions` | The target user's session could not be identified and more than one is active, so there is no safe fallback | Confirm the account is signed in on that host. On multi-user hosts the account must have its own session. |

### The after-execution behavior did not happen

| Message | Cause | Resolution |
|---|---|---|
| `Could not find active session to log off for user` | The user's own session could not be identified. The Agent will not sign out a session it cannot positively match | Confirm the account had a session. This is a deliberate safeguard, not a defect. |
| `Could not find active session to lock for user` | Same, for locking | As above. |
| `Fallback lock method (SimpleLockWorkstation) failed` | The session may remain unlocked after the task | Treat as a security-relevant event. Check the policies and privileges. |
| `Unknown AfterExecutionAction value` | The task stores a behavior this Agent version does not recognize | The task was authored on a newer version. Update the Agent, or reselect the behavior. |

### RDP login failures

See [RDP Login](./rpa-rdp-login.md) for the full table. The distinction that matters for triage: a logon failure, a locked account, or an expired password are all **credential** problems on the integration, while a timeout or a missing prerequisite are **connectivity or deployment** problems.

## Answering "why does RPA need administrator rights?"

This question arrives through security reviews, and the honest answer is narrower than the question assumes.

**What to say:**

- The automation itself runs at the privilege level of the account that owns it. It is not elevated.
- Local administrator rights are needed to run the installer and to apply two Windows security policies. Both are one-time setup steps.
- In Full mode, the default, the Agent service runs as Local System because it has to unlock and switch desktop sessions, which are privileged Windows operations restricted to that account. The service performs no automation itself. Where that is not acceptable and every task can run in the background, the Agent can be installed in Background only mode, with no administrator rights — see [Background only Agent mode](./rpa-background-only-mode.md).
- The two security policies relax Windows defaults across the whole host, so a dedicated RPA host with restricted access is the appropriate compensating control.

**What not to say:** that RPA "requires local admin to run." It does not. Ongoing operation needs no administrator rights.

Hand the customer [Service Accounts and Permissions](./rpa-permissions.md). It is written for exactly this audience and includes the installer's full change inventory.

## What 1.2.0 changes

1.2.0 changes what an RPA host needs signed in. The RPA Agent service still runs as Local System, and the installer configures that — see [Why Full mode runs as Local System](./rpa-permissions.md#why-the-service-runs-as-local-system).

| Change | What it means |
|---|---|
| **RDP login creates the session** | Previously a person had to sign in on the host so RPA had a session to unlock. OpCon can now sign the account in over Remote Desktop before the task runs, which removes both the standing signed-in session and the manual step after a reboot. See [RDP Login](./rpa-rdp-login.md). |
| **No session for background tasks at all** | Web Macro and Scan Document tasks no longer need a desktop session of any kind. The Agent starts them in a host process as the task's execution user, so on a host running only these task types nothing signs in. See [Unattended Session](./rpa-unattended-session.md). |
| **A standing session is no longer required** | With an [unattended session](./rpa-unattended-session.md), a Windows session need only exist while a task is running. This is not automatic — it takes an RDP login user paired with the **Log off user** After Execution Behavior on each task. **Lock workstation** and **Do nothing** still leave the account signed in between runs. |

Together these remove the *requirement* for a continuously signed-in account. Whether one still exists on a given host depends on how its tasks are configured.

## What 1.3.0 changes

| Change | What it means |
|---|---|
| **Robot Tasks can run in the background** | A Robot Task that needs no desktop can run in a host process as its run-as user, like a Web Macro. It needs no session, and its run-as user needs **Log on as a batch job** or **Allow log on locally** instead. See [Background and foreground execution](./robot-task-rpa.md#background-and-foreground-execution). |
| **Start failures name the missing right** | When a background task's host process cannot start because of a missing logon right, the result text names the account and both rights, instead of a generic failure. |
| **A foreground task binds only to its own user's session** | A Robot Task is never started in a session belonging to a different user than its execution user. |
| **Background only mode** | An Agent can be installed to run only background tasks, as `NT SERVICE\RPA.Agent`. See [Background only Agent mode](./rpa-background-only-mode.md). |

## Before escalating

Collect these. A case without them will be sent back.

1. The Agent log from `C:\ProgramData\Continuous\OpCon RPAAgent\Logs\Agent` (`log<yyyymmdd>.txt`) covering the failed run.
2. The account shown in the **Log On As** column for the **RPA Agent** service.
3. Whether both settings in [Security Settings](./rpa-security-settings.md) are applied, and whether the host was rebooted afterwards.
4. Whether the automation account was signed in, and whether its session was locked.
5. The Windows edition of the host, and whether it is single user or multi-user.
6. Whether the task uses an RDP login user, and whether it runs in the background or the foreground.
7. The exact error text shown in OpCon.

## FAQs

**A customer says RPA runs as admin, unattended, logged in continually. Is that accurate?**
Partly, and the distinction matters. The Agent *service* runs as Local System because it has to unlock and switch desktop sessions, but it runs no automation. The accounts that run tasks are ordinary user accounts and need no administrator rights. The standing signed-in session is the real finding, and RDP login is what lets you remove it — once the tasks are set to sign the account in per run and sign it out afterwards.

**The task fails immediately with no Agent log entry. Where do I look?**
The failure is upstream of the Agent. Check that OpCon can reach the Agent's HTTPS URI and that the API token matches. See [Installation - OpCon RPA Agent and Netcom Relay](./installation-opcon-rpa.md).

**Do the two security policies need to be reapplied after an update?**
No. They are host settings and survive an Agent update.

**A privilege was granted but the service still cannot unlock a session. Why?**
Unlocking is restricted to Local System, and the installer configures Local System for every Agent installed in Full mode, so a Full Agent that cannot unlock has had its account changed by hand — confirm with `sc qc RPA.Agent`. An Agent installed in Background only mode does not unlock sessions at all. **Act as part of the operating system** makes no difference; do not grant it. Otherwise, remember that a privilege granted in Local Security Policy takes effect for a service only after the service restarts, so restart **RPA Agent**.

**Can the automation account be a domain account?**
Yes. It signs in to the host the same way a person would, and needs only the rights its applications require.

**Does moving the service off Local System break session unlocking?**
Yes. Unlocking, switching, and locking sessions are available to Local System only, and no combination of privileges granted to another account changes that. On an Agent installed in Full mode, if `sc qc RPA.Agent` shows anything other than `LocalSystem`, the account was changed by hand after installation, which is not supported — repair or reinstall the Agent rather than editing the service's **Log On** tab.

## Related topics

- [Service Accounts and Permissions](./rpa-permissions.md)
- [RDP Login](./rpa-rdp-login.md)
- [Security Settings](./rpa-security-settings.md)
- [Troubleshooting](./troubleshooting-opcon-rpa.md)
- [Robot Task](./robot-task-rpa.md)
- [Background only Agent mode](./rpa-background-only-mode.md)

## Glossary

| Term | Definition |
|------|-----------|
| Compensating control | A security measure applied in place of a control that cannot be used — for example a dedicated, access-restricted host in place of the Windows defaults the two RPA policies relax. |
| Credential Provider | A DLL the Windows sign-in and lock screens load to handle credentials. OpCon RPA installs its own on every Full mode installation, so the Agent can unlock sessions with no one at the keyboard. A Background only installation does not install it. |
| Standing session | A Windows session that stays signed in between task runs. RDP login removes the need for one. |
| Privilege | A Windows right to perform a system-level operation, assigned in Local Security Policy under **User Rights Assignment**. Distinct from a file or folder permission. |
| Logon right | A right in **User Rights Assignment** that lets an account log on in a particular way, such as **Log on as a batch job** or **Allow log on locally**. A background task's run-as user needs one of these two. |
