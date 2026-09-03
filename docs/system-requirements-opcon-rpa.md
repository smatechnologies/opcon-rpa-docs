---
sidebar_label: 'System Requirements'
title: OpCon RPA system requirements
description: "Operating system, processor, memory, disk, and software requirements for installing OpCon RPA on a Windows host."
tags:
  - Reference
  - System Administrator
  - RPA
  - Installation
hide_title: true
---

# System Requirements

OpCon RPA installs as a single package on a Windows host. One installation provides both the RPA Agent Windows service and the RPA Tray Client, so there is nothing to install separately on either side.

## Supported operating systems

OpCon RPA requires 64-bit (x64) Windows. 32-bit systems are not supported.

The following operating systems are supported:

- Windows Server 2016
- Windows Server 2019
- Windows Server 2022
- Windows Server 2025
- Windows 11

:::note
Operating systems that have reached the end of Microsoft support are not supported, including Windows Server 2008 R2, Windows Server 2012, Windows Server 2012 R2, Windows 8.1, and Windows 10.
:::

## Computer requirements

- Processor — 64-bit (x64), 2GHz or faster, quad core or more
- Memory — 4GB or more
- Disk space — reserve 1GB to 4GB, depending on how much logging you need to store
- Screen resolution — 1920x1080 or higher

## Software requirements

| Requirement | Details |
|---|---|
| .NET Framework 4.8 | Required by the RPA Tray Client and by the host process that runs Web Macro and Scan Document tasks. Windows Server 2022, Windows Server 2025, and Windows 11 include a compatible version. On Windows Server 2016 and Windows Server 2019, confirm .NET Framework 4.8 is installed before you run the installer. |
| .NET 8 | Included with the RPA Agent, which ships as a self-contained x64 build. You do not need to install the .NET 8 runtime separately. |

## Related topics

- [Install OpCon RPA Agent and Netcom Relay](./installation-opcon-rpa.md)
- [Security Settings](./rpa-security-settings.md)
- [Service Accounts and Permissions](./rpa-permissions.md)
