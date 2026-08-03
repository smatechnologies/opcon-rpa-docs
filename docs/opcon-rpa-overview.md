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

This section describes how to install, configure, and operate OpCon RPA, and how to orchestrate OpCon RPA jobs from OpCon.

## In this section

| Page | What it covers |
|------|----------------|
| [System Requirements](./system-requirements-opcon-rpa.md) | Operating system, processor, memory, and disk requirements for the RPA Server, Client, and combined installations. |
| [Acquiring a License](./acquiring-a-license-opcon-rpa.md) | How to obtain an OpCon RPA license. |
| [Installation - OpCon RPA Agent and Netcom Relay](./installation-opcon-rpa.md) | Step-by-step installation of the RPA Agent, Netcom Relay (cloud), the ACS plugin, and the connection to OpCon. |
| [Service Accounts and Permissions](./rpa-permissions.md) | Which Windows account each component runs under, why the RPA Agent service requires the Local System account, and what the accounts that run robot tasks need. |
| [Installation - OpCon RPA for Cloud Customers on VPN](./install-cloud-vpn.md) | Where to host Netcom Relay when cloud customers connect over VPN. |
| [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md) | Update considerations and procedure for the RPA Agent, Tray Client, and ACS plugin. |
| [Orchestration with OpCon](./orchestration-with-opcon-opcon-rpa.md) | How to start RPA jobs from OpCon by frequency, dependency, or Self Service. |
| [Mapping OpCon Properties](./mapping-opcon-properties.md) | How to pass input and output data between OpCon and OpCon RPA using Schedule and Job Instance Properties. |
| [Troubleshooting](./troubleshooting-opcon-rpa.md) | Known limitations of OpCon RPA desktop recording and playback. |
| [Robot Task](./robot-task-rpa.md) | How OpCon RPA robot tasks work, including execution context and credential handling. |
| [Security Settings](./rpa-security-settings.md) | Windows local security policies required for OpCon RPA foreground task execution. |
| [Copy a Task](./copy-task-rpa.md) | How to copy a task or version from the Archive and Drafts grids, including the three copy modes. |
| [Delete a Task](./delete-task-rpa.md) | How to delete a published task and all its versions, or delete a single draft. |

## Where to start

- **First-time install:** Start with [System Requirements](./system-requirements-opcon-rpa.md), then [Acquiring a License](./acquiring-a-license-opcon-rpa.md), then [Installation - OpCon RPA Agent and Netcom Relay](./installation-opcon-rpa.md).
- **Reviewing security posture and required permissions:** Read [Service Accounts and Permissions](./rpa-permissions.md) and [Security Settings](./rpa-security-settings.md).
- **Connecting RPA jobs to OpCon schedules:** Read [Orchestration with OpCon](./orchestration-with-opcon-opcon-rpa.md) and [Mapping OpCon Properties](./mapping-opcon-properties.md).
- **Configuring task behavior:** Read [Robot Task](./robot-task-rpa.md) and [Security Settings](./rpa-security-settings.md).
- **Managing existing tasks:** Read [Copy a Task](./copy-task-rpa.md) and [Delete a Task](./delete-task-rpa.md).
- **Updating an existing install:** Read [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md).

## FAQs

**What does OpCon RPA automate that OpCon alone cannot?**
OpCon RPA automates interactions with applications that lack APIs or scheduled-job interfaces — typically desktop or web applications that require keyboard and mouse input. OpCon orchestrates these RPA tasks alongside its existing workload automation.

**How does OpCon RPA relate to VisualCron RPA?**
Both products provide RPA capabilities. OpCon RPA is the Continuous-supported product and is the focus of this section. VisualCron RPA documentation is included in a separate section for customers using that integration.

**Do I need Netcom Relay?**
Netcom Relay is required when integrating RPA with a cloud instance of OpCon CORE Automate / Solution Manager. On-premises installations do not require Relay.

## Glossary

| Term | Definition |
|------|-----------|
| RPA | Robotic Process Automation. Software that records and plays back human interactions (keystrokes, mouse actions) with applications that lack programmatic interfaces. |
| RPA Agent | The agent that performs robot task automation on a target Windows machine. |
| RPA Tray Client | The local Windows interface that runs alongside the RPA Agent, used to configure the OpCon API connection and tokens. It runs in a signed-in user's session under that user's account. |
| Local System account | The built-in Windows account (`NT AUTHORITY\SYSTEM`) that the RPA Agent service runs under. |
| Netcom Relay | The OpCon component that routes communication between the OpCon Server and the RPA Agent for cloud installations. |
| ACS Plugin DLL | The OpCon Application Connection Studio plugin file that lets the OpCon SAM communicate with the RPA Agent. |
| Robot task | A recorded sequence of interactions that the RPA Agent plays back when triggered. |
