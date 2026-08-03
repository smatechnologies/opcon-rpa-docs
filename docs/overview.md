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

## FAQs

**What does OpCon RPA automate that OpCon alone cannot?**
OpCon RPA automates interactions with applications that lack APIs or scheduled-job interfaces — typically desktop or web applications that require keyboard and mouse input. OpCon orchestrates these RPA tasks alongside its existing workload automation.

**Who is OpCon RPA designed for?**
OpCon RPA is designed for US financial institutions — banks, credit unions, and insurance companies — that already use OpCon for workload automation and want to extend that automation into manual, UI-driven processes.

**How does OpCon RPA relate to VisualCron RPA?**
Both products provide RPA capabilities. OpCon RPA is the Continuous-supported product; VisualCron RPA documentation is included for customers using that integration.

**What Windows permissions does OpCon RPA require?**
The RPA Agent service runs under the Windows Local System account, which it needs to unlock and switch desktop sessions. The accounts that run robot tasks are separate and do not need local administrator rights. See [Service Accounts and Permissions](./rpa-permissions.md).

## Glossary

| Term | Definition |
|------|-----------|
| RPA | Robotic Process Automation. Software that records and plays back human interactions (keystrokes, mouse actions) with applications that lack programmatic interfaces. |
| Last mile | The final manual steps in an automated process — typically UI interactions that an API-based scheduler cannot perform. |
| Robot task | A recorded sequence of interactions that the RPA agent plays back when triggered. |

## Support information

- [SMA Support Links and User Community](https://smatechnologies.my.site.com/SMAOpConUserCommunity/s/login/)
- [Full VisualCron User Documentation](https://www.visualcron.com/documentation.aspx)
