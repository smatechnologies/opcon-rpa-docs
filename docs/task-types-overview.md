---
sidebar_label: 'Task Types'
title: OpCon RPA task types
description: "The three OpCon RPA task types — Robot, Web Macro, and Scan Document — what each one automates, and how to choose between them."
tags:
  - Conceptual
  - Automation Engineer
  - RPA
hide_title: true
---

# Task Types

## What is it?

OpCon RPA has three task types. Which one you build determines what you can automate, whether the task needs a signed-in Windows session, and which activities are available to you.

| Task type | Automates | Needs a desktop session |
|---|---|---|
| [Robot Task](./robot-task-rpa.md) | The Windows desktop — any application, by driving its windows and controls — plus file, folder, and list work | Only when it runs in the foreground. See [Background and foreground execution](./robot-task-rpa.md#background-and-foreground-execution) |
| [Web Macro](./web-macro-task.md) | A process in a web browser, recorded against an embedded browser | No |
| [Scan Document](./scan-document-task.md) | Reading text, tables, and barcodes out of documents and images | No |

## Choosing a task type

Start from what the process touches.

- **It uses a Windows application** — a teller platform, a core banking client, an ERP front end, Excel, Outlook. Use a **Robot Task**. This is the only type that drives the Windows desktop.
- **It moves, reads, or writes files and folders, or works through list data**, with no application window involved. Use a **Robot Task** built only from background-safe activities, with **Force foreground** cleared. It runs in the background, with nobody signed in. See [Background and foreground execution](./robot-task-rpa.md#background-and-foreground-execution).
- **It happens entirely in a browser** — a portal, a web form, a supplier site. Use a **Web Macro**. It runs against its own embedded browser rather than the user's, which is what lets it run with nobody signed in.
- **It reads values out of documents** — invoices, statements, scanned forms. Use a **Scan Document** task. You mark the regions to read once, and every document that matches the file filter is read the same way.

A process that spans more than one of these is built as more than one task, chained in an OpCon schedule. A Robot Task can also drive a browser window if you need the user's real browser rather than the embedded one, but a Web Macro is the better tool when the process is web-only.

:::note Only foreground Robot Tasks need somebody signed in
A Robot Task that drives the desktop runs in the foreground, so it needs a Windows session to run in — either one a person signed in to, or one OpCon creates over Remote Desktop. See [Unattended Session](./rpa-unattended-session.md). Web Macro and Scan Document tasks, and Robot Tasks that run in the background, run in their own host process with no interactive session at all.

They still need a Windows account to run *as*, though. A background task runs as its execution user, and a task with no execution user fails, whether or not anybody is signed in. Set an Execution Context on every task. The exception is a Background only Agent, which runs every task as its own service account — see [Background only Agent mode](./rpa-background-only-mode.md).

The task editor prompts you when the execution context is missing: the **Execution Context Required** window explains the requirement and asks whether to configure it now. Select **Yes** to open the configuration.

![Execution Context Required window in the task editor, asking whether to configure the execution context now](../static/img/Tasks/execution-context-required.png)
:::

## What every task type shares

| Concept | Applies to |
|---|---|
| **Execution Context** — the Windows account the task runs as | All three. Robot Tasks also choose whether they may run in the background, and a foreground Robot Task controls what happens to the session before and after the run |
| **Credentials** — the encrypted Windows credentials RPA uses to run as that account | All three |
| [Wildcard Matching](./rpa-wildcard-matching.md) — the `*`, `?`, and `#` patterns | Robot Task window titles and element text, and the file and folder filters used by Scan Document and by file activities. Which characters each field accepts is listed on that page |
| Versioning, drafts, publishing, [copy](./copy-task-rpa.md) and [delete](./delete-task-rpa.md) | All three |
| [Import and export](./import-export-tasks-opcon-rpa.md) | All three |

## FAQs

**Can one task do both desktop and web automation?**
A Robot Task can drive a browser window on the desktop, so yes in that sense. But a Web Macro is more reliable for a web-only process, because it targets page elements directly rather than screen positions, and it does not need a desktop session.

**Which task types run without anyone signed in?**
Web Macro and Scan Document, and Robot Tasks that run in the background. They still need an account to run as — see the note above. A Robot Task that runs in the foreground needs a session as well as an account — see [Unattended Session](./rpa-unattended-session.md).

**Do all three support an execution user?**
Yes, though the form differs. A Robot Task's Execution Context also holds the **Force foreground** option and, for a foreground run, the session behavior before and after the run. For Web Macro and Scan Document, and for a Robot Task that resolves to the background, the window shows only the credentials, because there is no desktop session to lock or sign out.

**Can I convert a task from one type to another?**
No. The task type is fixed when you create the task. Build a new task of the type you need.

## Related topics

- [Robot Task](./robot-task-rpa.md)
- [Web Macro](./web-macro-task.md)
- [Scan Document](./scan-document-task.md)
- [Wildcard Matching](./rpa-wildcard-matching.md)
- [Unattended Session](./rpa-unattended-session.md)
