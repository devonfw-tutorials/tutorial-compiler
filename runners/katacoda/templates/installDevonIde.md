<%= text; %>

## devonfw setup

Create the directory where the devonfw ide will be installed.

`mkdir devonfw`{{execute}}

`cd devonfw`{{execute}}


To install devonfw execute the following commands. More information about setting up your ide on https://devonfw.com/website/pages/docs/devonfw-ide-introduction.asciidoc.html#setup.asciidoc
`wget -c https://bit.ly/2BCkFa9 -O - | tar -xz`{{execute}}

`bash setup`{{execute}}

The installation process may take a while.

The installation routine will ask you for a settings url. If you don't have a project specific settings, you can continue by pressing Enter, but let's continue with our tutorial specific URL:
`https://github.com/devonfw/katacoda-scenarios-ide-settings.git`{{execute}}

Accept the licence agreements.
`yes`{{execute}}

The devonfw ide is now installed. To use the new 'devon' commands you have the open a new terminal or use the following command:

`. ~/.bashrc`{{execute}}

<%= textAfter; %>