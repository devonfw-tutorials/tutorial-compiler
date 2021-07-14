<%= text; %>

<%= cdCommand; %>

<% if(bashCommand.interrupt) { %>
<% if(bashCommand.cdCommand) { %>
Run `<%= bashCommand.name; %>` with this command.`<%= bashCommand.name; %> <%= bashCommand.args; %>`{{execute T<%= bashCommand.terminalId; %>}}
<% } else { %>
Some command is already running in terminal <%= bashCommand.terminalId; %>. Rerun the command to stop and relaunch it automatically. `<%= bashCommand.name; %> <%= bashCommand.args; %>`{{execute T<%= bashCommand.terminalId; %> interrupt }}
<% } }else { %>
Run `<%= bashCommand.name; %>` with this command.
`<%= bashCommand.name; %> <%= bashCommand.args; %>`{{execute T<%= bashCommand.terminalId; %>}} 
<% } %>

<%= textAfter; %>

