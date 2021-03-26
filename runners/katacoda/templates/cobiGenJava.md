<%= text; %>

## CobiGen Java

<% if(useVsCode) { %>
Open the following java file in the IDE.
`devonfw/workspaces/main/<%= javaFile; %>`{{open}}

You can use the plugin simply via the context menu. Make a right click on the java file (in the explorer on the left or in the editor itself). The context menu will open and you can start the CobiGen Plugin by clicking on 'CobiGen'.

A terminal will open on the bottom of the IDE and CobiGen CLI will start.

You can choose the templates CobiGen should use by entering the numbers in the terminal of the IDE.

`<%= cobiGenTemplates; %>`
<% } else { %>
Start CobiGen CLI and pass the file as parameter by executing the following command.
`devon cobigen generate <%= javaFile; %>`{{execute T1}}

CobiGen will ask you which files to generate. You can enter the numbers separated by commas. 
`<%= cobiGenTemplates; %>`{{execute T1}}

CobiGen will now generate code based on the source file and the templates you have passed.
<% } %>

<%= textAfter; %>