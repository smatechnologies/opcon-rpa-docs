---
sidebar_label: 'Troubleshooting'
title: OpCon RPA troubleshooting
description: "Known limitations of OpCon RPA desktop recording and playback."
tags:
  - Reference
  - Operations Staff
  - RPA
hide_title: true
---

# Troubleshooting

## What is it?

This page documents known limitations of OpCon RPA desktop recording and playback, and the one task failure that is caused by how a task is configured rather than by the host. Use this page to confirm whether a behavior is expected before starting deeper troubleshooting.

For failures involving privileges, session unlocking, or sign-in, see [Permissions Troubleshooting](./rpa-permissions-troubleshooting.md), which maps Agent error messages to causes.

## Where the logs are

Every OpCon RPA component logs under one root on the host, `C:\ProgramData\Continuous\OpCon RPAAgent\Logs`, with a subfolder per component and one file per day.

| Component | Subfolder | Notes |
|---|---|---|
| RPA Agent service | `Agent` | Files are named `log<yyyymmdd>.txt`. Start here for anything about sessions, privileges, or dispatch |
| RPA Tray Client | `TrayClient\<username>` | One folder per signed-in user, since each session runs its own Tray Client |
| Web Macro and Scan Document host process | `HeadlessRunner\<execution user>` | One folder per account a task runs as, because the host process runs as that account. Its task log events are also forwarded to the Agent's log |

:::note ProgramData is hidden by default
`C:\ProgramData` does not appear in File Explorer unless hidden items are shown. Enter the path in the address bar to reach it.
:::

## Known limitations

- The RPA desktop recorder takes full control of the host system in order to run the workflow.
  - A dedicated machine is preferred for running the playback of desktop RPA tasks, to ensure sufficient resources are available and that the recording and playback of tasks do not interfere with the management of other critical operations.

- RPA desktop tasks can only support recording workflow on the host system on which the OpCon RPA Tray Client is installed.
  - The RPA desktop recorder does not currently support the ability to replay workflow recorded on a remote virtual machine.

## A Web Macro or Scan Document task fails with no execution user

A Web Macro or Scan Document task runs in its own host process with no interactive session. That process is never run as Local System, and there is no fallback to the interactive RPA Tray Client. A task with no execution user therefore fails before it starts, reporting that the task has no execution context and no identity to run as.

An RPA Tray Client signed in on the host does not rescue the task: with no execution user there is nothing to match a client against, so the task would run as whichever user happened to be registered first. It fails instead of running as an arbitrary identity.

To resolve it, open the task, set an execution user, and save it. Saving is what writes the value, so a task authored on an earlier version has to be saved once even if nothing about it looks changed.

This affects every installation, so an existing task can start failing on a host that has not otherwise changed. See [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md#120).

## FAQs

**Why did a Web Macro or Scan Document task that used to run stop running after the update to 1.2.0?**
It probably has no stored execution user. Open the task, set an execution user, and save it — saving is what stores the value, and earlier versions never stored one for these task types. See the [options above](#a-web-macro-or-scan-document-task-fails-with-no-execution-user).

**Can I record an RPA desktop task on one machine and replay it on another virtual machine?**
No. The RPA desktop recorder does not currently support replaying workflow recorded on a remote virtual machine. Recording and playback must occur on the host system on which the OpCon RPA Tray Client is installed.

**Should I use a dedicated machine for OpCon RPA playback?**
A dedicated machine is preferred. The RPA desktop recorder takes full control of the host system, so dedicating a machine helps ensure sufficient resources and prevents the recording and playback from interfering with other critical operations. A dedicated host is also the compensating control recommended for the two Windows security policies OpCon RPA requires. See [Security Settings](./rpa-security-settings.md).

## Related topics

- [Permissions Troubleshooting](./rpa-permissions-troubleshooting.md)
- [Service Accounts and Permissions](./rpa-permissions.md)
- [Robot Task](./robot-task-rpa.md)
- [Task Types](./task-types-overview.md)
- [Unattended Session](./rpa-unattended-session.md)
