---
sidebar_label: 'Service Accounts and Permissions'
title: OpCon RPA service accounts and permissions
description: "Which Windows account each OpCon RPA component runs under in Full and Background only mode, what the installer changes on the machine, and why the accounts that run robot tasks do not need local administrator rights."
tags:
  - Conceptual
  - System Administrator
  - Compliance Team
  - RPA
hide_title: true
---

# Service Accounts and Permissions

## What is it?

OpCon RPA runs as two separate programs on the Windows machine, and they do **not** share a privilege level. Which account the Agent runs as depends on the **Agent mode** chosen when it was installed:

- In **Full** mode, the default, the **RPA Agent service** runs as Local System (`NT AUTHORITY\SYSTEM`). It is a machine-level service: it holds the machine's own privileges, not a user's. Each **RPA Tray Client** runs inside a signed-in user's own desktop session, under that user's own Windows account. It runs the automation, and it has only the privileges that account already has.
- In **Background only** mode, the RPA Agent service runs as the virtual account `NT SERVICE\RPA.Agent`, with no administrator rights and no extra Windows privileges. It runs every task itself, in the background, as that account. The Tray Client is only the task editor.

In Full mode, the split is what matters during a security review. The Agent is privileged because it has to prepare Windows sessions; the automation is not. The user accounts that run robot tasks do not need local administrator rights. A Full mode installation also registers an OpCon RPA **credential provider** — a DLL that the Windows sign-in interface loads — which the RPA Agent service uses to unlock and switch desktop sessions with no one at the keyboard. It is not a separate process and it runs no automation. See [What the installer changes on the machine](#what-the-installer-changes-on-the-host).

In Background only mode there is no privileged service and no credential provider, and tasks run as the Agent's own account. See [Background only Agent mode](./rpa-background-only-mode.md).

## Account summary

| Component | Runs under | Who sets it | Privilege level |
|-----------|-----------|-------------|-----------------|
| **RPA Agent service**, Full mode (displayed as **RPA Agent** in Windows Services) | Local System (`NT AUTHORITY\SYSTEM`) | The installer, from the Agent mode chosen at install | Full local machine privilege |
| **RPA Agent service**, Background only mode | `NT SERVICE\RPA.Agent` | The installer, from the Agent mode chosen at install | No administrator rights. Only the **Bypass traverse checking** privilege (`SeChangeNotifyPrivilege`) |
| **Tasks**, Background only mode | `NT SERVICE\RPA.Agent`, the same account as the service | Fixed by the mode. A task with a run-as user is refused | The same as the service |
| **RPA Tray Client** (one instance per signed-in Windows session) | The Windows account signed in to that session | Whoever signs in to the session | The same privileges as that account. The Tray Client requests no elevation. |

## What the installer changes on the machine {#what-the-installer-changes-on-the-host}

`RPAAgent_x.y.z.msi` is a per-machine install. Use this list when you inventory the changes OpCon RPA makes to a Windows machine.

| Change | Full mode | Background only mode |
|--------|-----------|----------------------|
| Registers a Windows service | Service name `RPA.Agent`, displayed as **RPA Agent**, running as Local System and started automatically | Service name `RPA.Agent`, displayed as **RPA Agent**, running as `NT SERVICE\RPA.Agent` and started automatically. The service SID type is set to unrestricted, and the service's required privileges are reduced to `SeChangeNotifyPrivilege`, so the Agent and every task process run without **Impersonate a client after authentication** and the other privileges a service normally holds |
| Installs program files | `C:\Program Files\RPAAgent` — the Agent, the Tray Client, and the task editor | The same |
| Grants the service account its rights | Nothing is granted. Local System already holds every local privilege, so the installer changes no Windows rights or folder permissions | No Windows user rights are granted. The service account gets folder and file permissions, listed in [Folder permissions for a Background only Agent](#folder-permissions-for-a-background-only-agent) |
| Installs and registers a credential provider | `InteractiveLogonCPx64.dll` is installed to `C:\Windows\System32` and registered under `HKEY_LOCAL_MACHINE` both as a COM server and as a Windows credential provider. The RPA Agent service uses it to unlock and switch desktop sessions when no one is at the machine | Not installed |
| Starts the Tray Client at every sign-in | An `RPATray` value under `HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Run` starts the Tray Client in the session of each user who signs in to the machine | Not added. The Tray Client is installed and opens from the Start menu |
| Records the mode | `"AgentMode": "Full"` in `appsettings.json` | `"AgentMode": "BackgroundOnly"` in `appsettings.json` |
| Opens two inbound listeners (when the service runs) | HTTPS on the port shown in the Tray Client's **Https Url** field (7047 by default), which OpCon connects to; and net.tcp on port 9296, which the Tray Clients on that machine connect to. **As shipped both bind to `localhost`**, so neither is reachable from another machine until the **Https Url** is changed to the machine's own name or address. | The same |

### Folder permissions for a Background only Agent

A Background only install grants `NT SERVICE\RPA.Agent` the following, and nothing broader:

| Path | Permission | Why |
|---|---|---|
| `C:\Program Files\RPAAgent\DataCache` | Modify, inherited by everything in it | The task database. The Agent does not start without it |
| `C:\Program Files\RPAAgent\appsettings.json` | Modify | The Agent writes its installation ID and settings changes |
| `C:\ProgramData\RPA.TrayClient` | Modify, inherited | The secret the Tray Client uses to connect, rewritten every time the Agent starts |
| `C:\ProgramData\Continuous\OpCon RPAAgent\Logs\Agent` | Modify, inherited | The Agent log |
| `C:\ProgramData\Continuous\OpCon RPAAgent\Logs\HeadlessRunner` | Read & execute and create folders, on that folder only | The background task process creates its own log folder there |
| `C:\ProgramData\VisualCron\data\ocr` | Modify, inherited | Scan Document OCR language data |
| `C:\ProgramData\RPA\Work` | Modify, inherited. The folder is created if it does not exist | The work folder for task files. See [The work folder](./rpa-background-only-mode.md#the-work-folder) |
| The private key of the HTTPS certificate, when `appsettings.json` names one by thumbprint | Read | The Agent cannot accept HTTPS connections without it. The shipped configuration uses the certificate file under `Certs` and needs no grant |

Uninstalling a Background only Agent revokes these permissions and the certificate key grant.

:::note Credential provider in scope for a security review
In Full mode, OpCon RPA installs its own credential provider rather than driving the built-in Windows one. Because the Windows sign-in interface loads it, include it in the scope of any review of the machine. The RPA Agent service passes the automation account's credentials to it over a named pipe on the local machine; the credentials do not leave the machine.

Every Full mode installation installs it. If your standards do not permit a third-party credential provider on the sign-in interface, install the Agent in Background only mode, or raise it with Continuous support before deploying.
:::

:::note Firewall
The installer does not create a Windows Firewall rule. If OpCon or Netcom Relay connects from another machine, allow inbound traffic on the HTTPS port yourself.
:::

## Why Full mode runs as Local System {#why-the-service-runs-as-local-system}

In Full mode, the RPA Agent service prepares a desktop session before a robot task runs and returns it to a safe state afterwards. Depending on the Execution Context, it unlocks a locked session, switches between sessions, locks a session that belongs to a different user, or locks the session when the task finishes. To do that it drives the OpCon RPA credential provider and the Windows sign-in interface, and Windows restricts those operations to Local System. Obtaining another user's session token in this way needs more than any single privilege that can be granted to an ordinary account.

Starting a background task as its execution user is a separate, lesser operation, but it is performed by the same service, so it inherits the same account.

A Background only Agent does none of this: it prepares no sessions and runs no task as another user, which is why it can run without Local System. See [Background only Agent mode](./rpa-background-only-mode.md#what-a-background-only-agent-runs).

:::caution Act as part of the operating system
**Act as part of the operating system** (`SeTcbPrivilege`) is the privilege that lets an account assume the identity of any user on the machine. Local System holds it inherently, as it holds every local privilege. The installer grants it to nothing, in either mode.
:::

### Which account is in use

Run `sc qc RPA.Agent` in an elevated command prompt and check `SERVICE_START_NAME`. It reads `LocalSystem` on a Full mode Agent and `NT SERVICE\RPA.Agent` on a Background only Agent. The Agent also records its mode, its service account, and the privileges present in its token every time it starts successfully, in `C:\ProgramData\Continuous\OpCon RPAAgent\Logs\Agent`.

Changing the account on the **Log On** tab in Windows Services is not supported, in either mode. The Agent checks its account against its mode when it starts, and refuses to start when they do not match; see [Troubleshooting](./troubleshooting-opcon-rpa.md#agent-does-not-start-mode-mismatch). To change the account, [change the Agent mode](./rpa-background-only-mode.md#switch-modes).

## What the automation accounts need

This section applies to Full mode. On a Background only Agent, every task runs as `NT SERVICE\RPA.Agent`, and there are no automation accounts.

A robot task that runs in the foreground runs inside the desktop session of its Execution Context user, through the Tray Client running in that session. A task that runs in the background — a Web Macro, a Scan Document task, or a Robot Task whose activities are all background-safe — runs in a host process the Agent starts as that user, with no session. Either way, the automation acts with exactly the privileges of that Windows account — no more.

:::note A background task needs a logon right
The execution user of a background task needs **Log on as a batch job** or **Allow log on locally** on the machine. Without either, the task ends **Aborted**. See [A background task ends Aborted because its run-as user cannot log on](./troubleshooting-opcon-rpa.md#a-background-task-ends-aborted-because-its-run-as-user-cannot-log-on).
:::

:::note A foreground task's account must have a session before the task runs
The Execution Context user of a foreground Robot Task needs a session on the machine, with its Tray Client connected to the Agent, before the Agent can prepare it. The session may be locked — the Agent unlocks it. The Agent looks for that Tray Client before it prepares the session, so a task targeting an account with no session fails to start with an `RPA Client not found` error.

Give the task an **RDP login user** to have OpCon sign the account in first, which removes the need for anyone to sign in on the machine. See [Unattended Session](./rpa-unattended-session.md) — the recommended arrangement, because it leaves no signed-in desktop between runs.
:::

Set the privilege level of each automation account to whatever the applications it drives require:

- An account that drives a teller application needs only the rights that application requires
- An account that only reads and writes files in a shared folder needs only access to that folder
- No automation account needs local administrator rights on the RPA machine for OpCon RPA itself to work

This lets you apply the principle of least privilege per automated process. Use a separate Windows account for each automated business process so that activity in the Windows event log and in the application's own audit trail is attributable to a single process.

:::note Password changes
The RPA Agent stores the Windows credentials for each automation account in encrypted form. When an automation account's Windows password changes, update the stored credential from the Tray Client. See [Robot Task](./robot-task-rpa.md).
:::

## When local administrator rights are required

Local administrator rights on the RPA machine are required for setup, not for day-to-day operation.

| Task | Local administrator required | Why | How often |
|------|------------------------------|-----|-----------|
| Run the RPA Agent installer (`RPAAgent_x.y.z.msi`) | Yes | The installer registers a Windows service, sets folder permissions or registers a credential provider depending on the mode, and writes to `C:\Program Files` and `C:\Windows\System32` | At install, and at each update |
| Install Netcom Relay (cloud installations) | Yes | The Relay installer registers a Windows service | At install |
| Enable **Interactive logon: Do not require CTRL+ALT+DEL** and disable **User Account Control: Use Admin Approval Mode for the built-in Administrator account** | Yes | Local Security Policy changes require administrator rights. Needed only for Robot Tasks that run in the foreground. See [Security Settings](./rpa-security-settings.md). | Once, during setup |
| Grant a Background only Agent access to a folder, share, or site its tasks use | Yes, on the machine or file server that holds it | Changing permissions requires administrator rights there. See [Background only Agent mode](./rpa-background-only-mode.md#files-and-folders) | When a task needs a new location |
| Sign in as an automation account and lock the session | No | Standard interactive sign-in | Ongoing |
| Record, publish, or run a robot task | No | Runs at that account's privilege level, in the account's own session or, for a background run, in a host process started as that account | Ongoing |
| Open the Tray Client | No | The Tray Client requests no elevation | Ongoing |

After the installer has run and the security policies are applied, the accounts that run robot tasks do not need local administrator rights.

:::caution The two policies relax Windows defaults
Both settings remove a protection Windows applies by default, and they apply to the whole machine, not just to OpCon RPA. Record them in your security review along with the compensating controls you apply — for example a dedicated RPA machine, and restricted physical and remote-desktop access to it.
:::

## What the RPA Agent service does and does not do

Use this section when documenting the OpCon RPA privilege model for an internal security review or an examiner. It describes a Full mode Agent. For how a Background only Agent differs, see [Background only Agent mode](./rpa-background-only-mode.md).

**The RPA Agent service does:**

- Store the Windows credentials of automation accounts in encrypted form, in its own local database. The values are decrypted in memory only when they are needed — when a task runs, or when a stored credential is opened in the task editor — and are never written to disk in decrypted form
- Sign a user out of a desktop session when a task's After Execution Behavior is **Log off user**. It signs the session out directly, and falls back to asking the Tray Client in that session to sign itself out if it cannot — which also covers a session whose Tray Client has stopped responding. Either way it targets exactly the session that ran the task, not another session belonging to the same user — see [Robot Task](./robot-task-rpa.md)
- Unlock, switch, and lock desktop sessions, so the correct session is ready before a task runs and is returned to a safe state afterwards
- Record its mode, its service account, and the privileges present in its token in its log every time it starts successfully, so a mis-provisioned machine is diagnosable from the first lines of the log
- Hand a foreground task to the Tray Client running in the target user's session, and start a background task's host process as the task's execution user
- Accept connections from OpCon over HTTPS, authenticated with the API token. The Agent is the listener: OpCon (or Netcom Relay, for cloud installations) connects to the HTTPS URI you configured in Solution Manager during setup

**The RPA Agent service does not:**

- Run the automation under its own account. Every keystroke, mouse action, and application interaction of a foreground task happens inside the automation account's session, and a background task's host process runs as the automation account, under that account's privileges
- Grant automation accounts any privilege they do not already have
- Open the Remote Desktop connection that creates a session for an unattended run. OpCon does that — see [Unattended Session](./rpa-unattended-session.md)
- Hold a password of its own. Local System has no credential to manage, rotate, or leak, and neither has `NT SERVICE\RPA.Agent`
- Sign in to network resources as a user identity

:::note TLS certificate and API token
The Agent presents a self-signed certificate that ships with the installer, unless you supply your own by configuring its thumbprint — the certificate must then be installed in the Local Machine personal certificate store. On a Background only Agent, the installer grants the service account read access to that certificate's private key.

The API token is not created by the installer, and the service does not create one on its own. You generate it in the Tray Client with **Generate Token** and paste it into Solution Manager during setup. Only one token exists at a time — generating a new one replaces the old one. The token is stored encrypted, alongside a hash used to verify incoming requests. See [Installation - OpCon RPA Agent and Netcom Relay](./installation-opcon-rpa.md).
:::

For details on how credentials are encrypted and used, see [Robot Task](./robot-task-rpa.md).

## FAQs

**Which Windows account does the RPA Agent service run under?**
Local System (`NT AUTHORITY\SYSTEM`) on a Full mode Agent, and `NT SERVICE\RPA.Agent` on a Background only Agent. The mode is chosen when the Agent is installed. See [Account summary](#account-summary).

**Can I run the service under a less privileged account?**
Yes, by installing the Agent in Background only mode. It runs as `NT SERVICE\RPA.Agent` with no administrator rights, and runs only background tasks, all as that account. See [Background only Agent mode](./rpa-background-only-mode.md#choose-an-agent-mode).

**Do I have to grant the service account privileges myself?**
No. A Full mode Agent already holds every local privilege as Local System. A Background only install grants the service account the folders the Agent itself needs. You grant it, or the computer account, only the files, shares, and sites your tasks use.

**Is "Act as part of the operating system" granted to anything?**
The installer grants it to nothing, in either mode. Local System holds it inherently, because it is Local System.

**Can I change the service account by editing the service in Windows?**
No. The Agent refuses to start when its account does not match its Agent mode. See [Which account is in use](#which-account-is-in-use).

**Does the installer change anything at the Windows sign-in interface?**
In Full mode, yes. It installs an OpCon RPA credential provider (`InteractiveLogonCPx64.dll`) to `C:\Windows\System32` and registers it under `HKEY_LOCAL_MACHINE`, so the Windows sign-in interface loads it. A Background only install does not install it. See [What the installer changes on the machine](#what-the-installer-changes-on-the-host).

**Which network ports does the RPA Agent open?**
Two while the service runs: the HTTPS port shown in the Tray Client's **Https Url** field (7047 by default), which OpCon connects to, and net.tcp port 9296, which the machine's own Tray Clients connect to. **As shipped both bind to `localhost` rather than to every network interface**, so neither is reachable from another machine until the **Https Url** is changed. The installer does not create a firewall rule for either.

**Does the automation account have to be signed in before a task runs?**
On a Full mode Agent, a Robot Task that runs in the foreground needs a session with its Tray Client connected. The session may be locked — the Agent unlocks it. Without a session at all, the task fails to start. Give the task an RDP login user and OpCon signs the account in first, so no one has to sign in on the machine. See [RDP Login](./rpa-rdp-login.md).

Web Macro and Scan Document tasks, and Robot Tasks that run in the background, need no session at all. They run in a background process the Agent starts as the task's execution user. See [Background Robot Tasks need no session](./rpa-unattended-session.md#background-robot-tasks-need-no-session). On a Background only Agent, no task needs a session.

**Do the users that run robot tasks need local administrator rights?**
No. Each robot task runs at that user's privilege level, in the user's own desktop session or, for a background run, in a host process started as that user. Grant each automation account only the rights the applications it drives require.

**Does OpCon RPA need local administrator rights permanently?**
No. Local administrator rights are required to run the installer and to apply the two Windows local security policies described in [Security Settings](./rpa-security-settings.md). After setup, ongoing operation does not require them.

**Why does a Full mode service need any elevated privilege if the automation does not?**
Two reasons, both about starting work as somebody else. Starting a process as another Windows user needs **Replace a process level token** and **Adjust memory quotas for a process**; unlocking or switching a desktop session needs more than that again and is restricted to Local System. The automation itself uses none of it — it runs under the automation account, at that account's privilege level. See [Why Full mode runs as Local System](#why-the-service-runs-as-local-system).

**Where do I see the service in Windows?**
Open Windows Services and find **RPA Agent**. The **Log On As** column shows the account it runs under. Its service name is `RPA.Agent`, which is the name to use with `sc` or `Get-Service`.

## Related topics

- [Installation - OpCon RPA Agent and Netcom Relay](./installation-opcon-rpa.md)
- [Background only Agent mode](./rpa-background-only-mode.md)
- [Unattended Session](./rpa-unattended-session.md)
- [Permissions Troubleshooting](./rpa-permissions-troubleshooting.md)
- [RDP Login](./rpa-rdp-login.md)
- [Security Settings](./rpa-security-settings.md)
- [Robot Task](./robot-task-rpa.md)

## Glossary

| Term | Definition |
|------|-----------|
| Agent mode | The install-time choice of how the RPA Agent service runs: **Full**, as Local System, or **Background only**, as `NT SERVICE\RPA.Agent`. Upgrades keep it. |
| Local System | The built-in Windows account (`NT AUTHORITY\SYSTEM`) that holds every privilege on the local machine. A Full mode RPA Agent service runs as Local System so it can prepare desktop sessions. It has no password and cannot be used to sign in interactively. |
| `NT SERVICE\RPA.Agent` | The Windows virtual account a Background only RPA Agent service, and every task it runs, runs as. Windows manages it, it has no password, and it has no administrator rights. |
| RDP login user | The Windows credential OpCon signs in as over a Remote Desktop connection before a robot task runs, so the task has a session to run in. See [RDP Login](./rpa-rdp-login.md). |
| RPA Agent service | The Windows service that stores encrypted credentials and starts tasks. In Full mode it also manages desktop sessions and hands tasks to the Tray Client. Service name `RPA.Agent`, displayed as **RPA Agent** in Windows Services. |
| RPA Tray Client | The OpCon RPA application that runs in a signed-in user's Windows session. In Full mode it performs the automation for that user. In both modes it is the task editor. |
| Execution Context | The configured rules for how a robot task interacts with the machine before and after it runs, including which Windows account the task runs as. |
| Credential Provider | A DLL that the Windows sign-in and lock interfaces load to handle user credentials. A Full mode installation installs OpCon RPA's own (`InteractiveLogonCPx64.dll`) so that the RPA Agent service can unlock and switch sessions with no one at the keyboard. |
| Automation account | A Windows user account that robot tasks run as on a Full mode Agent, in its own desktop session or, for a background run, in a host process. |
| Act as part of the operating system | The Windows privilege (`SeTcbPrivilege`) that allows a process to obtain the identity of any user on the machine. Held inherently by the Local System account; never granted to any account by the OpCon RPA installer. |
| Replace a process level token | The Windows privilege (`SeAssignPrimaryTokenPrivilege`) that allows a process to start another process using a different user's token. Held inherently by Local System. |
| Adjust memory quotas for a process | The Windows privilege (`SeIncreaseQuotaPrivilege`) that accompanies **Replace a process level token** when starting a process as another user. Held inherently by Local System. |
| Bypass traverse checking | The Windows privilege (`SeChangeNotifyPrivilege`) that lets an account pass through folders it cannot open. The only privilege a Background only RPA Agent service keeps. |
| Principle of least privilege | The security standard that a user or automated process should have only the minimum access required to perform its intended function. |
