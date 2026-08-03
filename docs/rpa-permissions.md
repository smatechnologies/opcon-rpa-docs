---
sidebar_label: 'Service Accounts and Permissions'
title: OpCon RPA service accounts and permissions
description: "Which Windows account each OpCon RPA component runs under, what the installer changes on the host, why the RPA Agent service requires the Local System account, and why the accounts that run robot tasks do not need local administrator rights."
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

- The **RPA Agent service** runs under the Windows Local System account (`NT AUTHORITY\SYSTEM`). It needs that privilege level to unlock and switch desktop sessions.
- Each **RPA Tray Client** runs inside a signed-in user's own desktop session, under that user's own Windows account. It runs the automation, and it has only the privileges that account already has.

This split matters during a security review. The automation itself does not run with elevated privileges, and the user accounts that run robot tasks do not need local administrator rights.

The installer also registers an OpCon RPA **credential provider** — a DLL that the Windows sign-in interface loads — which the RPA Agent service uses to unlock and switch desktop sessions with no one at the keyboard. It is not a separate process and it runs no automation. See [What the installer changes on the host](#what-the-installer-changes-on-the-host).

## Account summary

| Component | Runs under | Who sets it | Privilege level |
|-----------|-----------|-------------|-----------------|
| **RPA Agent service** (displayed as **RPA Agent** in Windows Services) | Local System (`NT AUTHORITY\SYSTEM`) | The RPA Agent installer, automatically. The installer does not prompt for a service account. | Full local machine privilege |
| **RPA Tray Client** (one instance per signed-in Windows session) | The Windows account signed in to that session | Whoever signs in to the session | The same privileges as that account. The Tray Client requests no elevation. |

## What the installer changes on the host

`RPAAgent_x.y.z.msi` is a per-machine install. Use this list when you inventory the changes OpCon RPA makes to a Windows host.

| Change | Detail |
|--------|--------|
| Registers a Windows service | Service name `RPA.Agent`, displayed as **RPA Agent**, running as Local System and started automatically |
| Installs program files | `C:\Program Files\RPAAgent` — the Agent, the Tray Client, and the task editor |
| Installs and registers a credential provider | `InteractiveLogonCPx64.dll` is installed to `C:\Windows\System32` and registered under `HKEY_LOCAL_MACHINE` both as a COM server and as a Windows credential provider. The RPA Agent service uses it to unlock and switch desktop sessions when no one is at the machine. |
| Starts the Tray Client at every sign-in | An `RPATray` value under `HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Run` starts the Tray Client in the session of each user who signs in to the host |
| Opens two inbound listeners (when the service runs) | HTTPS on the port shown in the Tray Client's **HTTPS URI** field (7047 by default), which OpCon connects to; and net.tcp on port 9296, which the Tray Clients on that host connect to. Both listen on all network interfaces. |

:::note Credential provider in scope for a security review
OpCon RPA installs its own credential provider rather than driving the built-in Windows one. Because the Windows sign-in interface loads it, include it in the scope of any review of the host. The RPA Agent service passes the automation account's credentials to it over a named pipe on the local machine; the credentials do not leave the host.
:::

:::note Firewall
The installer does not create a Windows Firewall rule. If OpCon or Netcom Relay connects from another machine, allow inbound traffic on the HTTPS port yourself.
:::

## Why the RPA Agent service runs as Local System

The RPA Agent service is the component that prepares a desktop session before a robot task runs, and that returns the session to a safe state afterwards. Depending on the Execution Context, it unlocks a locked session, switches between sessions, locks a session that belongs to a different user, or locks the session when the task finishes. To do that, it drives the OpCon RPA credential provider and the Windows sign-in interface.

Windows restricts those operations. Obtaining another user's session token and starting a process inside that user's desktop session require these Windows privileges:

| Privilege | Shown in Local Security Policy as |
|-----------|-----------------------------------|
| `SeTcbPrivilege` | **Act as part of the operating system** |
| `SeAssignPrimaryTokenPrivilege` | **Replace a process level token** |

The Local System account holds both by default. It is also a better fit for this role than a named account, because:

- It has no password, so there is no credential to rotate, store, or leak
- It cannot be used to sign in interactively
- It is local to the machine. On the network it presents the computer account, not a user identity

:::caution Running the service under a named account is not supported
Local System is the only configuration OpCon RPA is installed with and tested under. Continuous has not verified the service running under a named account, and does not provide instructions for it.

If you choose to evaluate a named account in your own environment, let Continuous Support know, so they have the context if you open a case later. The change is reversible — setting the service back to Local System returns the host to the supported configuration.
:::

The rest of this section is background for that evaluation, not a procedure.

Granting a named account the two privileges above is **necessary but not sufficient**. The account would also need:

- Write access to `C:\Program Files\RPAAgent`, where the Agent keeps its database and logs. Default Program Files permissions grant this to SYSTEM and administrators only
- Access to the credential provider, which the Windows sign-in interface loads as Local System. A named account that is not administrator-equivalent is likely to be refused, in which case session unlocking fails

There is also a security trade-off to weigh. **Act as part of the operating system** lets an account assume the identity of any user on that machine, so granting it is a larger exposure than leaving the service as Local System — and by the time you have added the file permissions and the access above, the account is close to administrator-equivalent anyway.

## What the automation accounts need

Each robot task runs inside the desktop session of its Execution Context user, through the Tray Client running in that session. The automation therefore acts with exactly the privileges of that Windows account — no more.

:::note The account must already be signed in
The Execution Context user must already be signed in to the host, with its Tray Client connected to the Agent. The session may be locked — the Agent unlocks it. But the Agent looks for that Tray Client before it prepares the session, so a task targeting an account that has never signed in on the host fails to start with an `RPA Client not found` error.
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

## What the Local System service does and does not do

Use this section when documenting the OpCon RPA privilege model for an internal security review or an examiner.

**The RPA Agent service does:**

- Store the Windows credentials of automation accounts in encrypted form, in its own local database. The values are decrypted in memory only when they are needed — when a task runs, or when a stored credential is opened in the task editor — and are never written to disk in decrypted form
- Unlock, switch, or lock desktop sessions so the correct user session is ready before a task runs and is returned to a safe state afterwards
- Hand the task to the Tray Client running in the target user's session
- Accept connections from OpCon over HTTPS, authenticated with the API token. The Agent is the listener: OpCon (or Netcom Relay, for cloud installations) connects to the HTTPS URI you configured in Solution Manager during setup

**The RPA Agent service does not:**

- Run the automation itself. Every keystroke, mouse action, and application interaction happens inside the automation account's session, under that account
- Grant automation accounts any privilege they do not already have
- Hold a password. The Local System account has no credential to manage or rotate
- Sign in to network resources as a user identity

:::note TLS certificate and API token
The Agent presents a self-signed certificate that ships with the installer, unless you supply your own by configuring its thumbprint — the certificate must then be installed in the Local Machine personal certificate store.

The API token is not created by the installer. You generate it in the Tray Client with **Generate Token** and paste it into Solution Manager during setup; if no token exists, the service creates one the first time it starts. The token is stored encrypted, alongside a hash used to verify incoming requests. See [Installation - OpCon RPA Agent and Netcom Relay](./installation-opcon-rpa.md).
:::

For details on how credentials are encrypted and used, see [Robot Task](./robot-task-rpa.md).

## FAQs

**Which Windows account does the RPA Agent service run under?**
The Local System account (`NT AUTHORITY\SYSTEM`). The RPA Agent installer configures this automatically and does not prompt for a service account.

**Can I run the RPA Agent service under a named service account instead?**
Not as a supported configuration. Local System is the only one Continuous installs, tests, and supports. If you choose to evaluate a named account in your own environment, see [Why the RPA Agent service runs as Local System](#why-the-rpa-agent-service-runs-as-local-system) for what such an account would need, and let Continuous Support know, so they have the context if you open a case later. Setting the service back to Local System reverses the change.

**Does the installer change anything at the Windows sign-in screen?**
Yes. It installs an OpCon RPA credential provider (`InteractiveLogonCPx64.dll`) to `C:\Windows\System32` and registers it under `HKEY_LOCAL_MACHINE`, so the Windows sign-in interface loads it. The RPA Agent service uses it to unlock and switch sessions with no one at the keyboard. See [What the installer changes on the host](#what-the-installer-changes-on-the-host).

**Which network ports does the RPA Agent open?**
Two, both on all network interfaces while the service runs: the HTTPS port shown in the Tray Client's **HTTPS URI** field (7047 by default), which OpCon connects to, and net.tcp port 9296, which the host's own Tray Clients connect to. The installer does not create a firewall rule for either.

**Does the automation account have to be signed in before a task runs?**
Yes. The account must already be signed in with its Tray Client connected; the session may be locked, and the Agent unlocks it. A task targeting an account that has never signed in on the host fails to start.

**Do the users that run robot tasks need local administrator rights?**
No. Each robot task runs in that user's own desktop session at that user's privilege level. Grant each automation account only the rights the applications it drives require.

**Does OpCon RPA need local administrator rights permanently?**
No. Local administrator rights are required to run the installer and to apply the two Windows local security policies described in [Security Settings](./rpa-security-settings.md). After setup, ongoing operation does not require them.

**Why does the service need full local privilege if the automation does not?**
Unlocking a locked Windows session and starting a process inside another user's desktop session are privileged operations. Windows restricts them to accounts holding the privileges listed in [Why the RPA Agent service runs as Local System](#why-the-rpa-agent-service-runs-as-local-system), which the Local System account holds by default. The automation itself does not use those privileges — it runs under the automation account.

**Where do I see the service in Windows?**
Open Windows Services and find **RPA Agent**. The **Log On As** column shows **Local System**. Its service name is `RPA.Agent`, which is the name to use with `sc` or `Get-Service`.

## Related topics

- [Installation - OpCon RPA Agent and Netcom Relay](./installation-opcon-rpa.md)
- [Security Settings](./rpa-security-settings.md)
- [Robot Task](./robot-task-rpa.md)

## Glossary

| Term | Definition |
|------|-----------|
| Local System account | The built-in Windows account (`NT AUTHORITY\SYSTEM`) with full privilege on the local machine. It has no password and cannot be used to sign in interactively. |
| RPA Agent service | The Windows service that manages desktop sessions, stores encrypted credentials, and hands tasks to the Tray Client. Service name `RPA.Agent`, displayed as **RPA Agent** in Windows Services. |
| RPA Tray Client | The OpCon RPA application that runs in a signed-in user's Windows session and performs the automation for that user. |
| Execution Context | The configured rules for how a robot task interacts with the machine before and after it runs, including which Windows account the task runs as. |
| Credential Provider | A DLL that the Windows sign-in and lock screens load to handle user credentials. OpCon RPA installs its own (`InteractiveLogonCPx64.dll`) so that the RPA Agent service can unlock and switch sessions with no one at the keyboard. |
| Automation account | A Windows user account whose desktop session runs robot tasks. |
| Act as part of the operating system | The Windows privilege (`SeTcbPrivilege`) that allows a process to obtain the identity of any user on the machine. Held by the Local System account by default. |
| Replace a process level token | The Windows privilege (`SeAssignPrimaryTokenPrivilege`) that allows a process to start another process using a different user's token. Held by the Local System account by default. |
| Principle of least privilege | The security standard that a user or automated process should have only the minimum access required to perform its intended function. |
