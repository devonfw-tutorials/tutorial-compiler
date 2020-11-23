<%= text; %>

## devonfw setup

<%= cdCommand; %>

Create the directory where the devonfw ide will be installed.

`mkdir devonfw`{{execute}}

`cd devonfw`{{execute}}


To install devonfw execute the following commands. More information about setting up your ide on https://devonfw.com/website/pages/docs/devonfw-ide-introduction.asciidoc.html#setup.asciidoc

First you have do download and extract the installation files.

`wget -c https://bit.ly/2BCkFa9 -O - | tar -xz`{{execute}}

Now start the installation process. You have to specify a git repository where you can configure which tools will be installed within the IDE. The repository was already cloned by the setup script. It is located in the '/root/devonfw-settings' folder.

`bash setup /root/devonfw-settings/settings.git`{{execute}}

The installation process may take a while.

Accept the licence agreements.
`yes`{{execute}}

The devonfw ide is now installed. To use the new 'devon' commands you have the open a new terminal or use the following command:

`. ~/.bashrc`{{execute}}

<%= textAfter; %>