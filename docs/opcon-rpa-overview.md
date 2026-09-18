---
sidebar_label: 'OpCon RPA Overview'
title: OpCon RPA section overview
description: "Section overview of OpCon RPA — what the product does, who it is for, and a guide to the pages in this section."
tags:
  - Conceptual
  - Automation Engineer
  - RPA
---

# OpCon RPA

## What is it?

OpCon RPA is the OpCon Robotic Process Automation product. It extends OpCon workload automation through the **last mile** by automating desktop, web, or hybrid processes that pause for human interaction. OpCon RPA is designed for US financial institutions — banks, credit unions, and insurance companies — that already use OpCon for workload automation and want to extend that automation into manual, UI-driven processes.

This section describes how to install, configure, and operate OpCon RPA, and how to orchestrate OpCon RPA jobs from OpCon. It is the contents page for that material — for an introduction to what OpCon RPA is and what it automates, start with [Robotic Process Automation](./overview.md).

## In this section

| Page | What it covers |
|------|----------------|
| [System Requirements](./system-requirements-opcon-rpa.md) | Operating system, processor, memory, disk, and software requirements for the Windows host that runs OpCon RPA. |
| [Acquiring a License](./acquiring-a-license-opcon-rpa.md) | How to obtain an OpCon RPA license. |
| [Installation - OpCon RPA Agent and Netcom Relay](./installation-opcon-rpa.md) | Step-by-step installation of the RPA Agent, Netcom Relay (cloud), the ACS plugin, and the connection to OpCon. |
| [Service Accounts and Permissions](./rpa-permissions.md) | Which Windows account each component runs under, what the installer changes on the host, and what the accounts that run tasks need. |
| [Unattended Session](./rpa-unattended-session.md) | How a Robot Task gets a Windows session to run in when nobody is signed in at the host. |
| [RDP Login](./rpa-rdp-login.md) | How OpCon signs an account in over Remote Desktop for a Robot Task run. |
| [Permissions Troubleshooting](./rpa-permissions-troubleshooting.md) | Agent error messages about privileges, session unlocking, and sign-in, and what causes each one. |
| [Troubleshooting](./troubleshooting-opcon-rpa.md) | Known limitations of OpCon RPA desktop recording and playback. |
| [Installation - OpCon RPA for Cloud Customers on VPN](./install-cloud-vpn.md) | Where to host Netcom Relay when cloud customers connect over VPN. |
| [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md) | Update considerations and procedure for the RPA Agent, Tray Client, and ACS plugin. |
| [Back Up and Restore the Database](./rpa-backup-restore.md) | How to back up and restore the `DataCache` folder, and what a return to an earlier version requires. |
| [Mapping OpCon Properties](./mapping-opcon-properties.md) | How to pass input and output data between OpCon and OpCon RPA using Schedule and Job Instance Properties. |
| [Importing and Exporting Tasks](./import-export-tasks-opcon-rpa.md) | How to move tasks between RPA Agents. |
| [Task Types](./task-types-overview.md) | The three task types — Robot, Web Macro, and Scan Document — and which one to build. |
| [Wildcard Matching](./rpa-wildcard-matching.md) | The wildcard characters accepted in window titles, element text, and file and folder filters. |
| [Robot Task](./robot-task-rpa.md) | How OpCon RPA robot tasks work, including execution context and credential handling. |
| [Security Settings](./rpa-security-settings.md) | Windows local security policies required when the Agent service runs as Local System and unlocks desktop sessions. |
| [Web Macro](./web-macro-task.md) | How a Web Macro drives its own browser against page elements, with no desktop session. |
| [Native Clicks in Web Macros](./web-macro-native-clicks.md) | When a recorded click has to be replayed as a real mouse click. |
| [Scan Document](./scan-document-task.md) | How a Scan Document task extracts data from scanned documents. |
| [Scan Models](./scan-document-scan-models.md) | How to build the scan model that tells a Scan Document task where the data is. |
| [Copy a Task](./copy-task-rpa.md) | How to copy a task or version from the Archive and Drafts grids, including the three copy modes. |
| [Delete a Task](./delete-task-rpa.md) | How to delete a published task and all its versions, or delete a single draft. |

## Where to start

- **First-time install:** Start with [System Requirements](./system-requirements-opcon-rpa.md), then [Acquiring a License](./acquiring-a-license-opcon-rpa.md), then [Installation - OpCon RPA Agent and Netcom Relay](./installation-opcon-rpa.md).
- **Reviewing security posture and required permissions:** Read [Service Accounts and Permissions](./rpa-permissions.md) and [Security Settings](./rpa-security-settings.md).
- **Deciding what to build:** Read [Task Types](./task-types-overview.md), then the page for the type you need.
- **Connecting RPA jobs to OpCon schedules:** Read [Mapping OpCon Properties](./mapping-opcon-properties.md).
- **Configuring task behavior:** Read [Robot Task](./robot-task-rpa.md) and [Security Settings](./rpa-security-settings.md).
- **Running tasks with nobody signed in at the host:** Read [Unattended Session](./rpa-unattended-session.md) and [RDP Login](./rpa-rdp-login.md).
- **Managing existing tasks:** Read [Copy a Task](./copy-task-rpa.md) and [Delete a Task](./delete-task-rpa.md).
- **Updating an existing install:** Read [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md).

## FAQs

**Do I need Netcom Relay?**
Netcom Relay is required when integrating RPA with a cloud instance of OpCon CORE Automate / Solution Manager. On-premises installations do not require Relay.

For what OpCon RPA is and what it automates, see [Robotic Process Automation](./overview.md), which is the product introduction for this section.

## Glossary

Terms specific to deploying and running OpCon RPA. For the product's own vocabulary — RPA, last mile, robot task — see the glossary on [Robotic Process Automation](./overview.md).

| Term | Definition |
|------|-----------|
| RPA Agent | The agent that performs robot task automation on a target Windows machine. |
| RPA Tray Client | The local Windows interface that runs alongside the RPA Agent, used to configure the HTTPS URI and API token. It runs in a signed-in user's session under that user's account. |
| Local System | `NT AUTHORITY\SYSTEM`, the built-in Windows account holding every local privilege. The account the RPA Agent service runs as. |
| Netcom Relay | The OpCon component that routes communication between the OpCon Server and the RPA Agent for cloud installations. |
| ACS Plugin DLL | The OpCon Application Connection Studio plugin file that lets the OpCon SAM communicate with the RPA Agent. |
