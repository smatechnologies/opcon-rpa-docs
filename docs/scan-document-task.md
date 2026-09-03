---
sidebar_label: 'Scan Document'
title: OpCon RPA Scan Document tasks
description: "How a Scan Document task reads text, tables, and barcodes out of documents and images, what file types it accepts, and how the values it reads reach the rest of your automation."
tags:
  - Conceptual
  - Automation Engineer
  - RPA
hide_title: true
---

# Scan Document

## What is it?

A Scan Document task reads values out of documents. You open one representative document in the task editor, mark the regions you care about, and give each region a name. At run time the task applies those same regions to every document that matches its file filter, reads each one with optical character recognition, and publishes the results as variables the rest of your automation can use.

A typical use is a folder of invoices: mark the invoice number, the date, and the total once, then let the task read every invoice that lands in the folder.

The regions you mark are collectively the **scan model**. Building one is the part people find least obvious, because you draw the regions with the **right** mouse button. See [Scan Models](./scan-document-scan-models.md).

:::note No desktop session required
A Scan Document task does not drive a user interface, so it can run in its own host process with nobody signed in on the host. Building the task does need a desktop, because you mark the regions by hand. See [Unattended Session](./rpa-unattended-session.md).

It does still need a Windows account to run *as*: the execution user set on the task. A task with no execution user fails, so set an Execution Context on the task. The task editor prompts you with the **Execution Context Required** window when it is missing — see [Task Types](./task-types-overview.md).
:::

## What a task is made of

The task's **Scan document (local)** tab has two tabs of its own.

| Tab | What you set |
|---|---|
| **File filter** | Which documents the task reads. The same filter used elsewhere in OpCon RPA, so it supports wildcards, subfolders, exclusions, and filters on date, size, and attributes |
| **Scan properties** | The document viewer on the left, where you open a sample document and mark regions; the region list, preview, and settings on the right |

## Choosing the input documents

The **File filter** tab decides which files a run processes. In the simplest case you set **Folder** to a directory and leave **Include file mask** at its default `*`.

The mask accepts `*` and `?` — `statement-*.pdf` reads only the statements. Semicolons separate several masks, and **Is regex** switches the field to a regular expression instead. See [Wildcard Matching](./rpa-wildcard-matching.md).

:::caution `#` does not work in an include file mask
**Folder** and **Include file mask** are resolved by Windows, which recognizes only `*` and `?` in a search pattern. A mask like `statement-####.pdf` matches nothing. Use `statement-*.pdf`, or turn on **Is regex** and write `statement-\d{4}\.pdf`. See [Wildcard Matching](./rpa-wildcard-matching.md#fields-that-support-wildcards).
:::

Two things worth knowing:

- Select the **Test** tab and then **Show filtered files** to see exactly which files the current filter matches, before you run anything.
- If the filter matches no files, the task processes nothing and ends with a **Not found** result rather than a message about the filter. If a run appears to do nothing, check the filter first.

## Supported file types

| Type | Extensions | Multiple pages | Requires |
|---|---|---|---|
| Images | `.jpg`, `.jpeg`, `.jpe`, `.jfif`, `.png` | No | — |
| PDF | `.pdf` | Yes | — |
| TIFF | `.tif`, `.tiff` | Yes | — |
| GIF | `.gif` | Yes — each frame is treated as a page | — |
| Word | `.doc`, `.docx` | Yes | **Microsoft Word installed on the RPA host** |
| Web pages | `.html`, `.htm`, `.mhtml` | No — captured as one page | — |

:::caution Word documents need Word on the host
Reading `.doc` or `.docx` drives an installed copy of Microsoft Word, one instance per document. If Word is not installed on the RPA host, use PDF instead — for example by having an earlier job step convert the documents.
:::

:::note Pages are matched by position
Each region you mark belongs to a specific page of the document. A region on page 3 is read from page 3 of every document the task processes. Give a task a batch whose documents have a consistent page count — a document with fewer pages than the regions expect has nothing for those regions to read.
:::

## What a region can read

Each region has a type, which the editor sets for you the first time it reads the region and which you can change afterwards.

| Type | Produces |
|---|---|
| **Text** | The text found in the region |
| **Table** | The region parsed into rows and columns, written out as delimited text |
| **Barcode** | The value of the first barcode found in the region |
| **Image** | The region itself as an image, rather than text read from it — a base64-encoded PNG |

## How results reach your automation

There are two independent output settings: one per region, and one for the whole task.

Each region's **Output** tab picks exactly one destination, because the three options are radio buttons:

| Option | Result |
|---|---|
| **Output to Task Variable** | A variable named after the region. The default |
| **Output to Job Variable** | A job variable named after the region |
| **Output to file** | A file per region, at the **File path:** you set. No variable is published for that region |

The task's own **Output** tab then decides what the run writes as a whole — **Output to standard output**, which is the default and is what appears in the OpCon job's output, or **Output to file** for one file covering every region. Either way the content is one delimited `name`, `value` line per region, per document; turn on **Include field names** to prefix a `Name`/`Value` header line.

A region marked only as the end of a table is skipped entirely and produces neither a line nor a variable.

:::note There is no whole-document text output
The task reads only the regions you mark. It never returns the full text of a page. If you want everything on a page, mark a region that covers the page.
:::

For how variables are named and renamed, see [Scan Models](./scan-document-scan-models.md#name-each-region).

## Languages

Text recognition is language-specific, and **English is the only language available after a fresh install**. The language lists only ever offer languages already installed on the machine, so a language has to be downloaded before you can select it.

You set a language for the whole task under **General Language Settings**, and can override it for an individual region with **Override language** when one region is in a different language from the rest of the document.

To add a language, select the button beside the language list in **General Language Settings** — its tooltip reads "Add additional language support." The **Installing language packages** window lists every supported language with its download size; select the ones you want and select **Update**. The packages come from `nuget.org`, so the machine needs outbound HTTPS access to it.

:::caution Plan for the language download on a restricted network
On a locked-down host, download the languages you need while the host still has access to `nuget.org`, or have your network team allow it.

At run time the host downloads a missing language pack itself if it can, so a host that cannot reach `nuget.org` should have its languages installed in advance. A run whose language is unavailable does not produce the results you configured it for.
:::

## Improving recognition quality

Each region has five options on its **Scan** tab, all off by default. Turn them on only when a region reads badly — each one costs processing time, and they can make a clean region worse.

| Option | Use when |
|---|---|
| **Enhance resolution** | The region is small or low-resolution |
| **Enhance contrast** | The text is faint against its background |
| **Clean background noise** | The document is a noisy scan or a fax |
| **Detect white text on dark backgrounds** | The region is light text on a dark block |
| **Rotate and straighten** | The page was scanned at a slight angle |

The region is re-read as soon as you change any of these, so you can see the effect in the preview immediately.

## Troubleshooting

| Symptom | Cause | What to do |
|---|---|---|
| The run processes nothing and comes back **Not found** | The file filter matched no files | Check **Folder** and **Include file mask** on the **File filter** tab, and use **Show filtered files** on the **Test** tab. Check the mask for a `#`, which never matches |
| A variable comes back empty | Recognition found nothing in that region | Open the task, select the region, and check the preview. Try the enhancement options, or enlarge the region |
| No variable appears for a region at all | The region's **Output** tab is set to **Output to file**, which replaces the variable | Set it back to **Output to Task Variable** |
| Results are poor after selecting a non-English language | The language could not be downloaded and recognition fell back to English | Confirm the host can reach `nuget.org`, then reselect the language and check the preview |
| The task fails on some documents but not others | A region refers to a page the document does not have | Confirm every document in the batch has the same page count, or split the batch |
| A `.docx` document fails | Microsoft Word is not installed on the host | Install Word on the host, or convert the documents to PDF first |
| The task will not save, reporting that the scan model is not configured | No regions are marked | Mark at least one region. See [Scan Models](./scan-document-scan-models.md) |
| The task will not save, asking you to wait until all zones are scanned | A region is still being read | Wait for the spinner on the region to finish, then save |

## FAQs

**Do I have to mark regions, or can it just read the whole document?**
You have to mark them. The task reads only the regions in the scan model. To read a whole page, mark a region covering it.

**Can one task read documents with different layouts?**
No. The regions are positions on a page, so every document a task processes needs the same layout. Use a separate task per layout, and separate the documents with the file filter.

**Does the sample document I open get saved with the task?**
Yes. The document you open in the editor is stored in the task, so it travels with the task if you export it. Use a sample that you are comfortable sharing — not a real customer document.

**Can it read handwriting?**
No. Recognition is designed for printed text.

**Which languages are available?**
English immediately. Every other language has to be downloaded first, from **General Language Settings**, and that needs access to `nuget.org` from the machine.

**Does it need a signed-in user?**
No, but it does need an account to run as — its execution user. See [Unattended Session](./rpa-unattended-session.md).

## Related topics

- [Scan Models](./scan-document-scan-models.md)
- [Task Types](./task-types-overview.md)
- [Wildcard Matching](./rpa-wildcard-matching.md)
- [Unattended Session](./rpa-unattended-session.md)

## Glossary

| Term | Definition |
|------|-----------|
| Scan Document task | An OpCon RPA task type that reads text, tables, and barcodes out of documents and images. |
| Scan model | The set of regions marked on a sample document, which the task applies to every document it processes. |
| Region | A rectangle marked on a page, read as text, a table, a barcode, or an image, and published as a named variable. |
| Optical character recognition | Reading printed text out of an image of a page. |
| File filter | The settings that decide which files a run processes, including folder, file mask, and exclusions. |
