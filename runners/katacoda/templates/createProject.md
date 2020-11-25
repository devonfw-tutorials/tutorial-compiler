<%= text; %>

## Setting up your java project

<%= cdCommand; %>

Navigate to the 'workspaces/main/' folder in your devonfw installation directory.
`cd workspaces/main/`{{execute}}

Now you can use devon to setup a <%= language; %>  project for you by executing the following command.
`devon <%= language; %> create com.example.application.<%= name; %>`{{execute}}

Switch into the newly create project directory.
`cd <%= name; %>`{{execute}}

<%= textAfter; %>