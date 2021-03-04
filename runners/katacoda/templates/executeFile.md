<%= text; %>

<%= cdCommand; %>

<% if(!bashCommand.interrupt){ %>
Run <%= bashCommand.name; %> with this bash-command.  
<% } else { %>
<%= bashCommand.name; %> is already running in terminal <%= bashCommand.terminalId; %>.
Rerun the command to stop and relaunch it automatically.
<% } %>   

`bash <%= bashCommand.name; %> <%= bashCommand.args; %>`{{execute T<%= bashCommand.terminalId; %> <% if (bashCommand.interrupt) { %>interrupt<% } %>}}

<%= textAfter; %>