---
sidebar_label: 'Service Accounts and Permissions'
title: OpCon RPA service accounts and permissions
description: "Which Windows account each OpCon RPA component runs under, what the installer changes on the host, and why the accounts that run robot tasks do not need local administrator rights."
tags:
  - Conceptual
  - System Administrator
  - Compliance Team
  - RPA
hide_title: true
---

# Service Accounts and Permissions

## What is it?

OpCon RPA runs as two separate programs on the Windows host, and they do **not** share a privilege level:

- The **RPA Agent service** runs as Local System (`NT AUTHORITY\SYSTEM`). It is a machine-level service: it holds the host's own privileges, not a user's.
- Each **RPA Tray Client** runs inside a signed-in user's own desktop session, under that user's own Windows account. It runs the automation, and it has only the privileges that account already has.

This split is what matters during a security review. The Agent is privileged because it has to prepare Windows sessions; the automation is not. The user accounts that run robot tasks do not need local administrator rights.

The installer also registers an OpCon RPA **credential provider** — a DLL that the Windows sign-in interface loads — which the RPA Agent service uses to unlock and switch desktop sessions with no one at the keyboard. It is not a separate process and it runs no automation. See [What the installer changes on the host](#what-the-installer-changes-on-the-host).

## Account summary

| Component | Runs under | Who sets it | Privilege level |
|-----------|-----------|-------------|-----------------|
| **RPA Agent service** (displayed as **RPA Agent** in Windows Services) | Local System (`NT AUTHORITY\SYSTEM`) | Fixed by the installer. There is no service account option to choose. | Full local machine privilege |
| **RPA Tray Client** (one instance per signed-in Windows session) | The Windows account signed in to that session | Whoever signs in to the session | The same privileges as that account. The Tray Client requests no elevation. |

## What the installer changes on the host

`RPAAgent_x.y.z.msi` is a per-machine install. Use this list when you inventory the changes OpCon RPA makes to a Windows host.

| Change | Detail |
|--------|--------|
| Registers a Windows service | Service name `RPA.Agent`, displayed as **RPA Agent**, running as Local System and started automatically |
| Installs program files | `C:\Program Files\RPAAgent` — the Agent, the Tray Client, and the task editor |
| Grants the service account its rights | Nothing is granted. Local System already holds every local privilege, so the installer changes no Windows rights or folder permissions |
| Installs and registers a credential provider | `InteractiveLogonCPx64.dll` is installed to `C:\Windows\System32` and registered under `HKEY_LOCAL_MACHINE` both as a COM server and as a Windows credential provider. The RPA Agent service uses it to unlock and switch desktop sessions when no one is at the machine |
| Starts the Tray Client at every sign-in | An `RPATray` value under `HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Run` starts the Tray Client in the session of each user who signs in to the host |
| Opens two inbound listeners (when the service runs) | HTTPS on the port shown in the Tray Client's **Https Url** field (7047 by default), which OpCon connects to; and net.tcp on port 9296, which the Tray Clients on that host connect to. Both listen on all network interfaces. |

:::note Credential provider in scope for a security review
OpCon RPA installs its own credential provider rather than driving the built-in Windows one. Because the Windows sign-in interface loads it, include it in the scope of any review of the host. The RPA Agent service passes the automation account's credentials to it over a named pipe on the local machine; the credentials do not leave the host.

It is installed on every host, and there is no supported install option that omits it. If your standards do not permit a third-party credential provider on the sign-in screen, raise it with SMA Technologies support before deploying.
:::

:::note Firewall
The installer does not create a Windows Firewall rule. If OpCon or Netcom Relay connects from another machine, allow inbound traffic on the HTTPS port yourself.
:::

## Why the service runs as Local System

The RPA Agent service prepares a desktop session before a robot task runs and returns it to a safe state afterwards. Depending on the Execution Context, it unlocks a locked session, switches between sessions, locks a session that belongs to a different user, or locks the session when the task finishes. To do that it drives the OpCon RPA credential provider and the Windows sign-in interface, and Windows restricts those operations to Local System. Obtaining another user's session token in this way needs more than any single privilege that can be granted to an ordinary account.

Starting a background task as its execution user is a separate, lesser operation, but it is performed by the same service, so it inherits the same account.

:::note There is no service account option
1.2.0 briefly offered a choice of service account, including a least-privilege virtual account. That was withdrawn before release: supporting an Agent that might or might not be able to prepare a session made the behaviour of a task depend on how the host had been installed, which was harder to reason about than the privilege reduction was worth. The installer now always configures Local System, on every edition of Windows.

Silent installs need no service account properties. `SERVICEACCOUNTMODE`, `SERVICEACCOUNT`, and `SERVICEPASSWORD` do not exist; passing them has no effect.
:::

:::caution Act as part of the operating system
**Act as part of the operating system** (`SeTcbPrivilege`) is the privilege that lets an account assume the identity of any user on the machine. Local System holds it inherently, as it holds every local privilege. The installer grants it to nothing, because there is nothing to grant it to.
:::

### Which account is in use

Run `sc qc RPA.Agent` in an elevated command prompt and check `SERVICE_START_NAME`. It reads `LocalSystem` on every supported installation; anything else means the account was changed by hand after installation, which is not supported. The Agent also records its service account and the privileges present in its token every time it starts, in `C:\ProgramData\Continuous\OpCon RPAAgent\Logs\Agent`.

Changing the account on the **Log On** tab in Windows Services is not supported. The Agent needs Local System to prepare sessions, and no other account can be granted the equivalent.

## What the automation accounts need

Each robot task runs inside the desktop session of its Execution Context user, through the Tray Client running in that session. The automation therefore acts with exactly the privileges of that Windows account — no more.

:::note The account must have a session before the task runs
The Execution Context user needs a session on the host, with its Tray Client connected to the Agent, before the Agent can prepare it. The session may be locked — the Agent unlocks it. The Agent looks for that Tray Client before it prepares the session, so a task targeting an account with no session fails to start with an `RPA Client not found` error.

Give the task an **RDP login user** to have OpCon sign the account in first, which removes the need for anyone to sign in on the host. See [Unattended Session](./rpa-unattended-session.md) — the recommended arrangement, because it leaves no signed-in desktop between runs.
:::

Set the privilege level of each automation account to whatever the applications it drives require:

- An account that drives a teller application needs only the rights that application requires
- An account that only reads and writes files in a shared folder needs only access to that folder
- No automation account needs local administrator rights on the RPA host for OpCon RPA itself to work

This lets you apply the principle of least privilege per automated process. Use a separate Windows account for each automated business process so that activity in the Windows event log and in the application's own audit trail is attributable to a single process.

:::note Password changes
The RPA Agent stores the Windows credentials for each automation account in encrypted form. When an automation account's Windows password changes, update the stored credential from the Tray Client. See [Robot Task](./robot-task-rpa.md).
:::

## When local administrator rights are required

Local administrator rights on the RPA host are required for setup, not for day-to-day operation.

| Task | Local administrator required | Why | How often |
|------|------------------------------|-----|-----------|
| Run the RPA Agent installer (`RPAAgent_x.y.z.msi`) | Yes | The installer registers a Windows service, registers a credential provider, and writes to `C:\Program Files` and `C:\Windows\System32` | At install, and at each update |
| Install Netcom Relay (cloud installations) | Yes | The Relay installer registers a Windows service | At install |
| Enable **Interactive logon: Do not require CTRL+ALT+DEL** and disable **User Account Control: Use Admin Approval Mode for the built-in Administrator account** | Yes | Local Security Policy changes require administrator rights. See [Security Settings](./rpa-security-settings.md). | Once, during setup |
| Sign in as an automation account and lock the session | No | Standard interactive sign-in | Ongoing |
| Record, publish, or run a robot task | No | Runs inside the account's own session at that account's privilege level | Ongoing |
| Open the Tray Client | No | The Tray Client requests no elevation | Ongoing |

After the installer has run and the security policies are applied, the accounts that run robot tasks do not need local administrator rights.

:::caution The two policies relax Windows defaults
Both settings turn off a protection Windows applies by default, and they apply to the whole host, not just to OpCon RPA. Record them in your security review along with the compensating controls you apply — for example a dedicated RPA host, and restricted physical and remote-desktop access to it.
:::

## What the RPA Agent service does and does not do

Use this section when documenting the OpCon RPA privilege model for an internal security review or an examiner.

**The RPA Agent service does:**

- Store the Windows credentials of automation accounts in encrypted form, in its own local database. The values are decrypted in memory only when they are needed — when a task runs, or when a stored credential is opened in the task editor — and are never written to disk in decrypted form
- Sign a user out of a desktop session when a task's After Execution Behavior is **Log off user**. It signs the session out directly, and falls back to asking the Tray Client in that session to sign itself out if it cannot — which also covers a session whose Tray Client has stopped responding. Either way it targets exactly the session that ran the task, not another session belonging to the same user — see [Robot Task](./robot-task-rpa.md)
- Unlock, switch, and lock desktop sessions, so the correct session is ready before a task runs and is returned to a safe state afterwards
- Record its service account and the privileges present in its token in its log every time it starts, so a mis-provisioned host is diagnosable from the first lines of the log
- Hand the task to the Tray Client running in the target user's session
- Accept connections from OpCon over HTTPS, authenticated with the API token. The Agent is the listener: OpCon (or Netcom Relay, for cloud installations) connects to the HTTPS URI you configured in Solution Manager during setup

**The RPA Agent service does not:**

- Run the automation itself. Every keystroke, mouse action, and application interaction happens inside the automation account's session, under that account
- Grant automation accounts any privilege they do not already have
- Open the Remote Desktop connection that creates a session for an unattended run. OpCon does that — see [Unattended Session](./rpa-unattended-session.md)
- Hold a password of its own. Local System has no credential to manage, rotate, or leak
- Sign in to network resources as a user identity

:::note TLS certificate and API token
The Agent presents a self-signed certificate that ships with the installer, unless you supply your own by configuring its thumbprint — the certificate must then be installed in the Local Machine personal certificate store.

The API token is not created by the installer, and the service does not create one on its own. You generate it in the Tray Client with **Generate Token** and paste it into Solution Manager during setup. Only one token exists at a time — generating a new one replaces the old one. The token is stored encrypted, alongside a hash used to verify incoming requests. See [Installation - OpCon RPA Agent and Netcom Relay](./installation-opcon-rpa.md).
:::

For details on how credentials are encrypted and used, see [Robot Task](./robot-task-rpa.md).

## FAQs

**Which Windows account does the RPA Agent service run under?**
Local System (`NT AUTHORITY\SYSTEM`), on every supported installation. There is nothing to choose. See [Why the service runs as Local System](#why-the-service-runs-as-local-system).

**Can I run the service under a less privileged account?**
No. The Agent has to prepare desktop sessions — unlock, switch, lock — and Windows restricts those operations to Local System. A build during 1.2.0 development offered a least-privilege option; it was withdrawn before release.

**Do I have to grant the service account privileges myself?**
No, and there is nothing to grant. Local System already holds every local privilege, so the installer changes no Windows rights and no folder permissions.

**Is "Act as part of the operating system" granted to anything?**
The installer grants it to nothing. Local System holds it inherently, because it is Local System.

**Can I change the service account by editing the service in Windows?**
No. Changing the **Log On** tab leaves the service unable to prepare sessions, and no other account can be granted the equivalent. If `sc qc RPA.Agent` shows anything other than `LocalSystem`, the installation is in an unsupported state.

**Does the installer change anything at the Windows sign-in screen?**
Yes, on every host. It installs an OpCon RPA credential provider (`InteractiveLogonCPx64.dll`) to `C:\Windows\System32` and registers it under `HKEY_LOCAL_MACHINE`, so the Windows sign-in interface loads it. There is no install option that omits it. See [What the installer changes on the host](#what-the-installer-changes-on-the-host).

**Which network ports does the RPA Agent open?**
Two, both on all network interfaces while the service runs: the HTTPS port shown in the Tray Client's **Https Url** field (7047 by default), which OpCon connects to, and net.tcp port 9296, which the host's own Tray Clients connect to. The installer does not create a firewall rule for either.

**Does the automation account have to be signed in before a task runs?**
A Robot Task needs a session with its Tray Client connected. The session may be locked — the Agent unlocks it. Without a session at all, the task fails to start. Give the task an RDP login user and OpCon signs the account in first, so no one has to sign in on the host. See [RDP Login](./rpa-rdp-login.md).

Web Macro and Scan Document tasks need no session at all. They run in a host process the Agent starts as the task's execution user. See [Unattended Session](./rpa-unattended-session.md).

**Do the users that run robot tasks need local administrator rights?**
No. Each robot task runs in that user's own desktop session at that user's privilege level. Grant each automation account only the rights the applications it drives require.

**Does OpCon RPA need local administrator rights permanently?**
No. Local administrator rights are required to run the installer and to apply the two Windows local security policies described in [Security Settings](./rpa-security-settings.md). After setup, ongoing operation does not require them.

**Why does the service need any elevated privilege if the automation does not?**
Two reasons, both about starting work as somebody else. Starting a process as another Windows user needs **Replace a process level token** and **Adjust memory quotas for a process**; unlocking or switching a desktop session needs more than that again and is restricted to Local System. The automation itself uses none of it — it runs under the automation account, at that account's privilege level. See [Why the service runs as Local System](#why-the-service-runs-as-local-system).

**Where do I see the service in Windows?**
Open Windows Services and find **RPA Agent**. The **Log On As** column shows the account it runs under. Its service name is `RPA.Agent`, which is the name to use with `sc` or `Get-Service`.

## Related topics

- [Installation - OpCon RPA Agent and Netcom Relay](./installation-opcon-rpa.md)
- [Unattended Session](./rpa-unattended-session.md)
- [Permissions Troubleshooting](./rpa-permissions-troubleshooting.md)
- [RDP Login](./rpa-rdp-login.md)
- [Security Settings](./rpa-security-settings.md)
- [Robot Task](./robot-task-rpa.md)

## Glossary

| Term | Definition |
|------|-----------|
| Local System | The built-in Windows account (`NT AUTHORITY\SYSTEM`) that holds every privilege on the local machine. The RPA Agent service runs as Local System so it can prepare desktop sessions. It has no password and cannot be used to sign in interactively. |
| RDP login user | The Windows credential OpCon signs in as over a Remote Desktop connection before a robot task runs, so the task has a session to run in. See [RDP Login](./rpa-rdp-login.md). |
| RPA Agent service | The Windows service that manages desktop sessions, stores encrypted credentials, and hands tasks to the Tray Client. Service name `RPA.Agent`, displayed as **RPA Agent** in Windows Services. |
| RPA Tray Client | The OpCon RPA application that runs in a signed-in user's Windows session and performs the automation for that user. |
| Execution Context | The configured rules for how a robot task interacts with the machine before and after it runs, including which Windows account the task runs as. |
| Credential Provider | A DLL that the Windows sign-in and lock screens load to handle user credentials. OpCon RPA installs its own (`InteractiveLogonCPx64.dll`) so that the RPA Agent service can unlock and switch sessions with no one at the keyboard. |
| Automation account | A Windows user account whose desktop session runs robot tasks. |
| Act as part of the operating system | The Windows privilege (`SeTcbPrivilege`) that allows a process to obtain the identity of any user on the machine. Held inherently by the Local System account; never granted to any account by the OpCon RPA installer. |
| Replace a process level token | The Windows privilege (`SeAssignPrimaryTokenPrivilege`) that allows a process to start another process using a different user's token. Held inherently by Local System. |
| Adjust memory quotas for a process | The Windows privilege (`SeIncreaseQuotaPrivilege`) that accompanies **Replace a process level token** when starting a process as another user. Held inherently by Local System. |
| Principle of least privilege | The security standard that a user or automated process should have only the minimum access required to perform its intended function. |
