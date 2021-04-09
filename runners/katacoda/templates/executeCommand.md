<%= text; %>

<% if(!bashCommand.currentDir){ %>Change directory to the directory where we want to execute the command.
<% if(!bashCommand.interrupt){ %> With the next command we also open a new Terminal so you have to execute it twice. <% }%>
`cd <%= bashCommand.path; %> `{{execute T<%= bashCommand.terminalId; %> <% if (bashCommand.interrupt) { %>interrupt<% } %>}} <% } %>

<% if(!bashCommand.interrupt){ %>Run <%= bashCommand.name; %> with this bash-command. <% } else { %> <%= bashCommand.name; %> is already running in terminal <%= bashCommand.terminalId; %>. Rerun the command to stop and relaunch it automatically. <% } %>

`<%= bashCommand.name; %> <%= bashCommand.args; %>`{{execute T<%= bashCommand.terminalId; %> <% if (bashCommand.interrupt) { %>interrupt<% } %>}}

<%= textAfter; %>