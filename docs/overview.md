---
sidebar_label: 'Robotic Process Automation'
title: OpCon RPA overview
description: "Conceptual overview of OpCon Robotic Process Automation (RPA), including how it extends OpCon, who it serves, and where to find supporting documentation."
tags:
  - Conceptual
  - Automation Engineer
  - RPA
---

# Introduction to Robotic Process Automation (RPA)

## What is it?

OpCon Robotic Process Automation (RPA) continues automation through the **last mile** whether on a desktop, the web, or a hybrid of both. Where OpCon workflows, processes, or tasks pause for human intervention, OpCon RPA addresses manual gaps, enables end-to-end automation, and increases the efficiency of individual employees and the entire business.

OpCon RPA is an OpCon extension with exponential implications.

## Getting started

**Robotic Process Automation** refers to the ability to record a sequence of human interactions (keystrokes and mouse movements) with a program and play them back on demand.

**OpCon RPA** is designed for banks, credit unions, and insurance companies for use in tandem with OpCon, extending its functionality and usefulness.

OpCon RPA has three task types — Robot, Web Macro, and Scan Document. A Robot Task that drives the desktop runs in an interactive Windows session. Web Macro and Scan Document tasks, and Robot Tasks built only from activities that need no desktop, run in their own host process and need no signed-in Windows session. See [Task Types](./task-types-overview.md).

## FAQs

**What does OpCon RPA automate that OpCon alone cannot?**
OpCon RPA automates interactions with applications that lack APIs or scheduled-job interfaces — typically desktop or web applications that require keyboard and mouse input. OpCon orchestrates these RPA tasks alongside its existing workload automation.

**Who is OpCon RPA designed for?**
OpCon RPA is designed for US financial institutions — banks, credit unions, and insurance companies — that already use OpCon for workload automation and want to extend that automation into manual, UI-driven processes.

**What Windows permissions does OpCon RPA require?**
It depends on the Agent mode chosen during installation. In Full mode, the default, the RPA Agent service runs as Local System, which is what lets it unlock and switch desktop sessions with nobody at the keyboard. The accounts that run tasks are separate, run at their own privilege level, and do not need local administrator rights. In Background only mode, the service and every task run as the virtual account `NT SERVICE\RPA.Agent`, with no administrator rights. See [Service Accounts and Permissions](./rpa-permissions.md).

## Glossary

| Term | Definition |
|------|-----------|
| RPA | Robotic Process Automation. Software that records and plays back human interactions (keystrokes, mouse actions) with applications that lack programmatic interfaces. |
| Last mile | The final manual steps in an automated process — typically UI interactions that an API-based scheduler cannot perform. |
| Robot task | A recorded or assembled sequence of activities that the RPA agent plays back when triggered — in an interactive session, or in the background when no activity needs a desktop. |
| Web Macro | A task that drives its own browser against page elements, with no desktop session. |
| Scan Document | A task that extracts data from scanned documents, with no desktop session. |

## Support information

- [SMA Support Links and User Community](https://smatechnologies.my.site.com/SMAOpConUserCommunity/s/login/)
