---
sidebar_label: 'Installation - OpCon RPA for Cloud Customers on VPN'
title: Install OpCon RPA for cloud customers on VPN
description: "How to place Netcom Relay so that OpCon RPA works for cloud customers who reach OpCon through a VPN tunnel, including the internal URL requirement and how this changes the standard install."
tags:
  - Procedural
  - System Administrator
  - RPA
hide_title: true
---

# Install OpCon RPA for Cloud Customers on VPN

## What is it?

This page is an addition to the main [Installation - OpCon RPA Agent and Netcom Relay](./installation-opcon-rpa.md) procedure. It applies only when your OpCon instance is **in the cloud** and you reach it through a **VPN tunnel**.

In a VPN environment, the only difference from the standard cloud install is **where Netcom Relay runs** and **what URL you give it**. Once Relay is in place, the rest of the OpCon RPA installation is unchanged.

## When to use this page

Use this page if all of the following apply:

- Your OpCon instance is hosted in the cloud (OpCon CORE Automate / Solution Manager).
- Your network reaches OpCon over a VPN tunnel rather than the public Internet.
- You are installing **OpCon RPA**.

## How this changes the standard install

| Standard cloud install | Cloud + VPN (this page) |
|------------------------|-------------------------|
| Netcom Relay installed on any server that can reach the OpCon cloud instance over the public Internet. | Netcom Relay installed on a server that can reach the OpCon cloud instance **over the VPN tunnel**. |
| During Relay configuration, you enter the OpCon instance URL. | During Relay configuration, you enter the **internal URL** the customer uses to reach OpCon — not a public-facing URL. |
| Other steps in the install are the same. | Other steps in the install are the same. |

## Before you begin

Identify a server on the customer's network that meets **both** of the following:

- ✅ The server can communicate over the VPN tunnel to the customer's OpCon cloud instance.
- ✅ The server can communicate directly with the RPA Agent.

The server does not have to be dedicated to Relay, but both conditions must be met before you proceed.

You also need:

- The internal URL the customer uses to reach their OpCon instance.
- The standard Netcom Relay installer (`SMANetcomRelay.exe`) and Netcom Relay setup instructions. See [Netcom Relay setup](https://help.smatechnologies.com/opcon-relay#install).

## Step 1 — Install Netcom Relay on the VPN-capable server

To install Netcom Relay for OpCon RPA on VPN, complete the following steps:

1. On the server identified above, follow the standard [Netcom Relay setup](https://help.smatechnologies.com/opcon-relay#install) procedure. No VPN-specific changes are required to the installer itself.
2. When the installer prompts for the **instance name**, enter the **internal URL** the customer uses to reach OpCon — not a public-facing URL.
3. Complete the Relay installation as documented in the standard procedure.

## Step 2 — Continue the standard OpCon RPA installation

After Relay is in place, return to the main installation procedure and complete the rest of the install using the Relay server you just configured.

To finish the installation, complete the following steps:

1. Open [Installation - OpCon RPA Agent and Netcom Relay](./installation-opcon-rpa.md).
2. Follow Steps 1 through 6 of that procedure.
3. When Step 2 prompts for the Netcom Relay name in Solution Manager, enter the name you assigned to the Relay you installed in Step 1 of this page.

## Verify the installation

After completing the standard installation, confirm:

- The RPA Tray Client is running in the Windows system tray on the RPA Agent host.
- In Solution Manager, the RPA agent shows as available under **Library** > **Agents**.
- The RPA Agent can reach OpCon. (The "Get OpCon API Token" step in the main installation displays a success message when this is working.)

:::note Relay and other agents
A customer can be on VPN and use Relay at the same time. Relay communicates over the VPN tunnel rather than directly over the Internet. The RPA Agent is the only agent that routes through Relay — all other OpCon agents are unaffected.
:::

## FAQs

**Do OpCon RPA installations on VPN require Netcom Relay?**
Yes. Netcom Relay routes traffic between the RPA Agent and the OpCon cloud instance over the VPN tunnel.

**Does the Relay server need to be dedicated to RPA?**
No. The Relay server does not have to be dedicated, but it must be able to reach both the OpCon cloud instance over the VPN tunnel and the RPA Agent directly.

**Should I enter a public URL or an internal URL for the OpCon instance?**
Enter the **internal URL** the customer uses to reach the OpCon instance. Do not enter a public-facing URL — Relay must reach OpCon through the VPN tunnel.

**Will using Relay over VPN affect my other OpCon agents?**
No. The RPA Agent is the only agent that routes through Relay. All other OpCon agents are unaffected.

**Can I host Relay on a server that is not always reachable over the VPN?**
No. Relay must be able to reach both the OpCon cloud instance over the VPN and the RPA Agent at all times for OpCon RPA to function.

## Glossary

| Term | Definition |
|------|-----------|
| Netcom Relay | The OpCon component that routes communication between the OpCon Server and the RPA Agent for cloud installations. |
| RPA Agent | The agent that performs robot task automation on a target Windows machine. |
| VPN tunnel | A private network connection that cloud customers use to reach their OpCon cloud instance instead of the public Internet. |
| Internal URL | The URL the customer uses to reach OpCon over their VPN, as opposed to a public-facing URL. |
| Solution Manager | The OpCon web interface used to configure users, agents, and schedules. |
