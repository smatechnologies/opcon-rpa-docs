---
sidebar_label: 'Installation - OpCon RPA for Cloud Clients on VPN'
hide_title: true
---


## Install OpCon RPA for Cloud Clients on VPN​

Cloud clients connecting via VPN can still use OpCon RPA. However, Netcom Relay must be installed on a server that is able to communicate over the VPN tunnel to the OpCon cloud instance. That same server must also be able to communicate with the RPA Agent.

:::info Note 

Robot Tasks in VisualCron do not require Netcom Relay and will work over VPN without any additional configuration. The steps below apply to OpCon RPA only.

:::

### Before You Get Started​

Identify a server on the customer's network that meets both of the following requirements:

- The server can communicate over the VPN tunnel to the customer's OpCon cloud instance.
- The server can communicate directly with the RPA Agent.

This does not need to be a dedicated server, but both conditions must be met before proceeding.

### Installing Netcom Relay for VPN​

1. On the server identified above, follow the standard Netcom Relay installation procedure. For full instructions, click here. No changes to the standard installation steps are required for VPN environments.
2. When prompted for the instance name during Relay configuration, enter the internal URL the client uses to navigate to their OpCon instance — not a public-facing URL.
3. Once Relay is installed, continue with the standard OpCon RPA installation steps above, using the Relay server you just configured.

:::info Note 

A customer can be on VPN and use Relay simultaneously. Relay will communicate over the VPN tunnel rather than directly over the Internet. The RPA Agent is the only agent that routes through Relay — all other agents are unaffected.

:::