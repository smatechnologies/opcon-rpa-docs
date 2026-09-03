---
sidebar_label: 'Back Up and Restore the Database'
title: Back up and restore the OpCon RPA database
description: "How to back up the RPA Agent's local database before an update, how to restore it, and how to use a backup to return to an earlier version of OpCon RPA."
tags:
  - Procedural
  - System Administrator
  - RPA
hide_title: true
---

# Back Up and Restore the Database

## What is it?

The RPA Agent keeps everything it owns in one folder: `C:\Program Files\RPAAgent\DataCache`. That folder holds the local database, `SQLiteStorage.db`, which contains your tasks and all their versions, your drafts, your user variables, and your encrypted Windows credentials.

Backing it up is a matter of stopping the service and zipping the folder. It takes a minute, and it is the only way back from an update.

:::danger Back up before you update, not after
The database records which Agent version last wrote to it, and the Agent stamps that record every time it starts. Once 1.2.0 has started even once, the database is marked as 1.2.0 and an earlier Agent will refuse to open it.

The mark is the Agent's full four-part version, build number included, and the comparison is on the whole of it. Going back to an earlier build of the same release is blocked for the same reason as going back to 1.1.0.

A backup taken **before** the update is therefore the only route back to an earlier version. There is no way to convert the database afterwards.
:::

## Back up the database

You need local administrator rights on the RPA host.

To back up the database, complete the following steps:

1. Stop the RPA Agent service:
   1. Press the Windows key.
   2. Enter `services.msc` and press the **Enter** key.
   3. In the list, find **RPA Agent**.
   4. Right-click the service and select **Stop**.
2. Open File Explorer, enter `C:\Program Files\RPAAgent` in the address bar, and press the **Enter** key.
3. Right-click the **DataCache** folder and select **Send to** > **Compressed (zipped) folder**.
4. Rename the resulting zip file to include the version you are backing up from — for example `rpa_backup_1.1.0.zip`.
5. Copy the zip file somewhere off the RPA host: a network share, a backup volume, or wherever your organization keeps recovery material.
6. Start the RPA Agent service again: right-click **RPA Agent** and select **Start**.

:::note Take the whole folder, not just the database file
While the database is in use, SQLite keeps working files beside it — `SQLiteStorage.db-wal` and `SQLiteStorage.db-shm`, or `SQLiteStorage.db-journal`, depending on the mode the database is in. Either way they are part of the database rather than scratch files, and a `-wal` file can hold completed changes that are not in `SQLiteStorage.db` yet — so copying the database on its own can silently leave recent work behind. Stop the RPA Agent service first: a clean shutdown folds those files into the database and removes them. Then zip the entire `DataCache` folder, and if any `SQLiteStorage.db-*` files are still present, include them.

Stopping the service first is what makes the copy consistent. The Agent can be running when you take the backup, but then you are copying a database that is being written to.
:::

:::tip Name the file after the version it came from
The Agent refuses to open a database written by a newer version than itself, so a backup is only useful for the version it was taken from. Putting the version in the file name — `rpa_backup_1.1.0.zip` — is what makes that obvious a year later.
:::

The Agent's own settings live outside this folder, in `C:\Program Files\RPAAgent\appsettings.json`. Copy that file alongside the zip if you want to capture the Agent's configuration as well as its data. See [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md#step-2--back-up-your-settings-and-database).

## Restore the database

Restoring replaces the current database with the one in your backup. Everything created since the backup was taken is lost, including tasks, task versions, and credentials.

To restore the database, complete the following steps:

1. Stop the RPA Agent service, as in step 1 above. This is not optional for a restore — replacing the database under a running Agent corrupts it.
2. Open `C:\Program Files\RPAAgent`.
3. Rename the existing **DataCache** folder to `DataCache.old`. This is your way back if the restore turns out to be wrong.
4. Extract your backup zip into `C:\Program Files\RPAAgent` so that a new **DataCache** folder is created with the backup's contents.
5. Confirm the restored folder contains `SQLiteStorage.db`, and that no files are left over from the folder you renamed.
6. Start the RPA Agent service.
7. Open the RPA Tray Client and confirm your tasks are listed as expected.

Once you are satisfied with the restore, delete `DataCache.old`.

:::caution Do not merge a backup into the existing folder
Extract the backup into a clean folder rather than overwriting the files in place. The folder you are replacing can hold `SQLiteStorage.db-wal`, `SQLiteStorage.db-shm`, or `SQLiteStorage.db-journal` files left behind by the Agent you are moving away from, and any of those paired with a database they do not belong to produces a state that neither Agent wrote.
:::

## Return to an earlier version

Use this when you have updated to 1.2.0 and need to go back to 1.1.0. It only works if you took a backup before the update.

To return to an earlier version, complete the following steps:

1. Confirm you have a backup taken **before** the update to 1.2.0. Without one, stop here — an earlier Agent cannot open a 1.2.0 database.
2. Stop the RPA Agent service and close the RPA Tray Client.
3. Press the Windows key, enter `appwiz.cpl`, and press the **Enter** key.
4. Select the entry named **RPA Agent** followed by the installed version number — for example **RPA Agent 1.2.0.123** — and select **Uninstall**.
5. Restore your pre-update backup, following [Restore the database](#restore-the-database) from step 2. The uninstall leaves the `DataCache` folder in place, so there is still a 1.2.0 database there to replace.
6. Run the installer for the earlier version and complete the installation.
7. Start the RPA Agent service if it is not running, then confirm your tasks are listed in the Tray Client.

:::caution Credentials added on 1.2.0 do not come back
Credentials encrypted by 1.2.0 cannot be decrypted by 1.1.0. Your restored backup contains the credentials as they were before the update, so any credential added or changed while you were on 1.2.0 must be entered again after the downgrade.
:::

:::danger Going back further than 1.1.0 is unguarded
The version check exists only in 1.1.0 and later. An Agent older than 1.1.0 does not look at the marker at all, so it will open a database it does not understand instead of refusing. Restore a backup taken from that older version rather than pointing it at a newer database.
:::

## Troubleshooting

| Symptom | Cause | What to do |
|---|---|---|
| Windows reports that a file is in use when you zip the folder | The service has not finished releasing the database | Confirm **RPA Agent** shows as stopped in Windows Services, wait a few seconds, and try again. The database stays locked briefly after the service stops |
| A file is still locked after about 30 seconds | Something other than the service holds it — a half-stopped Agent process, or a database tool left open | Close any database tool, then check Task Manager for a lingering `RPA.Agent` process |
| The Agent will not start after a downgrade, reporting that the database was written by a newer version | The database is still the 1.2.0 one. The message reads `Database was written by a newer agent version (...); this agent is (...). Downgrade is not supported. Restore a pre-upgrade backup, or upgrade back to the latest agent version.` | Restore a backup taken before the update, or reinstall the newer Agent |
| The Agent will not start after a restore | The restored folder is incomplete, or the service was running during the restore | Restore again from the zip into a clean **DataCache** folder with the service stopped |
| Tasks are missing after a restore | The backup predates them | Those tasks were created after the backup was taken and are not recoverable from it |

## FAQs

**Do I have to stop the service to take a backup?**
Not strictly, but you should. Stopping the service stops writes to the database, which is what makes the copy consistent. A backup taken while the Agent is running may capture a database mid-write.

**Can I back up just the database file?**
No. Take the whole `DataCache` folder — any `SQLiteStorage.db-wal`, `SQLiteStorage.db-shm`, or `SQLiteStorage.db-journal` file belongs with the database it came from, and a `-wal` file can hold completed changes the database itself does not have yet.

**How often should I back up?**
Before every update, without exception. Beyond that, as often as losing your tasks and credentials would hurt.

**Where should I keep the zip?**
Anywhere off the RPA host. A backup sitting on the machine you are about to rebuild is not a backup.

**Why does the file name need a version number?**
Because a backup can only be restored into the version that wrote it, or a newer one. The Agent refuses to open a database written by a newer version than itself, so knowing which version a zip came from is what makes it usable.

**Can I restore a 1.1.0 backup onto 1.2.0?**
Yes. Restoring an older database into a newer Agent is supported — the Agent migrates it at startup and re-stamps the version. It is the other direction that is blocked.

**I updated to 1.2.0 without taking a backup and need to go back.**
That is not possible. The database is stamped as 1.2.0 and 1.1.0 will refuse to open it, and there is no conversion. You would have to start from an empty database and rebuild your tasks.

**Does the backup include the Agent's settings?**
No. Settings live in `appsettings.json` in the install folder, not in `DataCache`. Copy that file too if you want them.

**Does uninstalling the Agent delete my database?**
No. The uninstall leaves the `DataCache` folder in place, which is why a downgrade has to replace it explicitly.

## Related topics

- [Update - OpCon RPA Agent and ACS plugin](./update-opcon-rpa.md)
- [Installation - OpCon RPA Agent and Netcom Relay](./installation-opcon-rpa.md)
- [Importing and Exporting Tasks](./import-export-tasks-opcon-rpa.md)
- [Robot Task](./robot-task-rpa.md)

## Glossary

| Term | Definition |
|------|-----------|
| DataCache | The folder under the Agent's install directory holding the local database — tasks, task versions, drafts, user variables, and encrypted credentials. |
| Version marker | The record inside the database of which Agent version last wrote to it. The Agent stamps it at startup and refuses to open a database stamped by a newer version. |
| RPA Agent service | The Windows service that owns the database. Service name `RPA.Agent`, displayed as **RPA Agent** in Windows Services. |
