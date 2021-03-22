<%= text; %>

<% if(!bashCommand.currentDir){ %>Change Directory
`cd <%= bashCommand.path; %> `{{execute T<%= bashCommand.terminalId; %> <% if (bashCommand.interrupt) { %>interrupt<% } %>}} <% } %>

<% if(!bashCommand.interrupt){ %>Run <%= bashCommand.name; %> with this bash-command. <% } else { %> <%= bashCommand.name; %> is already running in terminal <%= bashCommand.terminalId; %>. Rerun the command to stop and relaunch it automatically. <% } %>

`<%= bashCommand.name; %> <%= bashCommand.args; %>`{{execute T<%= bashCommand.terminalId; %> <% if (bashCommand.interrupt) { %>interrupt<% } %>}}

<%= textAfter; %>