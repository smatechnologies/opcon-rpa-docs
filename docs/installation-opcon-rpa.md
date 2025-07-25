---
sidebar_label: 'Installation - OpCon RPA Agent and Netcom Relay'
hide_title: true
---

# Installation - OpCon RPA

### Install OpCon RPA for Cloud
The RPA Agent and Netcom Relay will need to be installed on the windows system that will be responsible for hosting the server and/or client and executing the RPA workflow.

You should have 3 items ready for before you get started with the RPA cloud setup. 

1.	The NetCom Relay installer, <ins>SMANetcomRelay.exe</ins>.  The NetCom Relay installer is not needed if you are not integrating RPA with a cloud instance of OpCon CORE Automate/Solution Manager.  For instructions on how to set up Relay, [click here](https://help.smatechnologies.com/opcon-relay#install)
  1.	On your Windows Computer open the command prompt and choose “Run as Administrator”.
  2.	When prompted if you’d like to allow this app to make changes to your device, choose “Yes”.
2.	The ACS Plugin DLL named <ins>sma.acs.OpConRPA.dll</ins>.
3.	The RPA Agent installer named <ins>RPAAgent.1.0.0</ins>.

#### Solution Manager Setup
1.  Log into Solution Manager with a user who has privileges to add users and grant the ‘Role_ocadm’ Role.
2.  Create a User for RPA (This user will be used later in the Step for the RPA Tray Client ‘In the OpCon API User field enter the username you’re logged in with your instance of Solution Manager’
3.  Navigate to LIBRARY → ACCESS MANAGEMENT → USERS → “+” to add a new user in the context of the selected user click the SETTINGS tab.
   1.  First Name: RPA
   2.  Last Name: User
   3.  Username: RPAUser
   4.  Password: (Set to unique value and remember for later)
   5.  Click on the button labeled “Save”
   6.  Click on the ROLES tab and check the box for Role_ocadm and click on the button labeled “Save”
   7.  Click on the SETTINGS tab and check the box for Enable external tokens and click on

#### RPA Agent and Relay Connection setup
1.	In your Windows File Explorer Navigate to C:\Programdata.   
2.	Drill down into the OpConxps directory until you reach the Plugins directory.
3.	Open the Plugins directory, this is where you’re going to put the RPA Plugin DLL file. For On-Prem users this should be C:\ProgramData\OpConxps\SAM\plugins.
 1.	Navigate to where you have the The ACS Plugin DLL.  It is called sma.acs.OpConRPA.dll. 
 2.	Move this .dll file into the plugins directory shown in step 2 of this section.

#### Testing what you’ve set up so far:
1.	Opening Solution Manager.
2.	Navigate to the Library > Agents.
3.	Click Add to add a new Agent.
 1.	Give your agent a name, remember this name, you’ll need it later. 
 2.	Select RPA from the type drop down above General Settings.
 3.	Open the RPA Settings section at the bottom of the page.
  1.	Leave this open, you’ll come back to it shortly.

#### FINALLY the RPA Installer
1.	Double click on the RPA Agent Installer.  It is named RPAAgent1.0.0 (though the version number might differ)
2.	When prompted if you’d like to allow this app to make changes to your device, choose “Yes”.
3.	When the installation is complete you will see the RPA user interface pop up on your screen.
4.	On the left side of the RPA interface click “Settings”.
![Activate License](../static/img/RPAInstaller_Step4.png) 
5.	When on the “Settings” screen make sure you’re on the RPA Agent tab and copy the value out of the Https URI field.
![Activate License](../static/img/RPAInstaller_Step5.png) 
6.	Paste that URI value into the RPA Server URI in Solution Manager.
![Activate License](../static/img/RPAInstaller_Step6.png) 
7.	Back in the RPA interface, click generate token.  Note, that this automatically copies the token to your clipboard.
![Activate License](../static/img/RPAInstaller_Step7.png) 
8.	Paste that token in the API Token field within Solution Manager.
![Activate License](../static/img/RPAInstaller_Step8.png) 
9.	Click to save your Solution Manager changes
10.	In the RPA “Settings” interface click on the OpCon API tab.
![Activate License](../static/img/RPAInstaller_Step10.png) 
11.	In the OpCon API URL field enter the same fully qualified domain name that you set in the Solution Manager Setup step 9. For On-Prem this is likely the base domain of your Solution Manager instance.
12.	In the OpCon API User field enter the username you’re logged in with your instance of Solution Manager.
13.	In the OpCon API Password field enter the password you set in step 3.2 of the Solution Manager Setup section.
14.	In the OpCon Agent Name field enter the name of the Agent you just created in step 3.1 of the Testing What You’ve Setup So Far.
15.	Click Get OpCon API Token in the lower right corner of the RPA interface.
16.	You should receive a success message at this point!!! Congratulations you’re ready to go!!!
