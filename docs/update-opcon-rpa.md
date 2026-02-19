---
sidebar_label: 'Update - OpCon RPA Agent and ACS plugin'
hide_title: true
---

# Update - OpCon RPA

### Update Considerations
#### 1.0.2
##### Plugin update
No update was made to the ACS plugin.
##### Agent/TrayClient
This version fixed a bug where passwords for Network Credentials were not being saved.
If you had any previous NetworkCredentials, even if you were not using them, they will need to have their passwords updated if they are to be
used with an Execution Context. Passwords are encrypted with Windows Data Protection API.

This version also made Execution Context required for all Robot tasks. Any existing Robot tasks will need to be saved and published again with an Execution Context defined.
See [Execution Context](./robot-task-rpa.md#execution-context) for more details.

Running existing Robot tasks will result in job failures.


#### 1.0.1
##### Plugin update
An update was made to the ACS plugin and is necessary to receive a bugfix on Agent status showing as available even if the Tray Client isn't actually running.

### Install OpCon RPA for Cloud
The RPA Agent and Netcom Relay should already be installed from following the [Installation Instructions](./installation-opcon-rpa.md)

:::tip Note

Use the [OpCon Web Installer (OWI)](https://github.com/smatechnologies/opcon-web-installer/releases) to download the **ACS Plugin DLL** (In the Integrations section) and **RPA Agent Installer**  (In the Agents section).

:::

Check the upgrade considerations to see if you need to update the ACS plugin

#### Before updating — stop the RPA Agent service and Tray Client
Do these steps before running the installer every time you update.

1. **Stop the RPA Agent service:** Press the Windows key, type **services.msc**, and press Enter. In the list, find "OpCon RPA Agent" (or "RPA Agent"), right-click it, and choose **Stop**.
2. **Close the Tray Client:** Exit the RPA Tray Client completely. Check that it is not just minimized to the system tray (the area near the clock in the bottom-right corner). If you see the RPA icon there, right-click it and choose **Exit** or **Close**.

![TrayClient](../static/img/tray.png)

:::info Backup Instructions (optional)
If you would like to make a backup of your settings before updating:

1. **Open the installation folder:** Open File Explorer, type or paste **C:\Program Files\RPAAgent** into the address bar, and press Enter.
2. **Back up your settings:** Right-click **appsettings.json** → **Copy**, then paste it into a safe folder (for example, your Desktop or Documents). Do the same for the **DataCache** folder—copy the whole folder to your safe location. Optionally, right-click the DataCache folder and choose **Send to** → **Compressed (zipped) folder** to create a zip file.
:::

#### Run the update
The RPA Agent Installer is named <ins>RPAAgent__*x.y.z*__.msi</ins> (x.y.z is the version number). After downloading from OWI, it is usually in your **Downloads** folder (Open File Explorer and click "Downloads" on the left, or check your browser’s download list).

Double-click the .msi file. When Windows asks "Do you want to allow this app to make changes to your device?", choose **Yes**. The update will complete and may relaunch the Tray Client automatically.
#### After the update — verify the service and Tray Client are running
After the installer finishes, confirm that both the RPA Agent service and the Tray Client are running. If either is not running, use the steps below to start it.

**1. Verify and start the RPA Agent service**
- Press the Windows key, type **services.msc**, and press Enter.
- In the list, find **OpCon RPA Agent** (or **RPA Agent**).
- Check the **Status** column. It should say **Running**.
- If it does not say Running, right-click the service and choose **Start**.

**2. Verify and start the Tray Client**
- Look for the RPA icon in the system tray (near the clock in the bottom-right corner). If you see it, the Tray Client is running.
- If you do not see the RPA icon, start the Tray Client manually: press the Windows key, type **OpCon RPA** (or the name of your RPA application), and click it in the Start menu. You can also look under **Start → All Apps** for the OpCon RPA entry.
- Once the Tray Client is open, you can minimize it to the tray; the Agent is then active and ready for use.


