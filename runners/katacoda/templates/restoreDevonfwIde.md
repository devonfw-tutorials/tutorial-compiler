<%= text; %>

## devonfw restoration

<%= cdCommand; %>

Now start the reinstallation process. The git repository is the same as the one specified in the installation process. Only the tools that will be installed have been changed. This was done by the setup script. It is located in the '/root/devonfw-settings' folder.

`bash setup /root/devonfw-settings/settings.git`{{execute}}

The installation process may take a while.

Accept the licence agreements.
`yes`{{execute}}

The devonfw ide is now installed. To use the new 'devon' commands you have the open a new terminal or use the following command:

`. ~/.bashrc`{{execute}}

<%= textAfter; %>