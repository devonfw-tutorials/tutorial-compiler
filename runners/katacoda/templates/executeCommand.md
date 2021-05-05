<%= text; %>

<% if(bashCommand.interrupt){%><% if(bashCommand.changeDir){%>We want to execute the command in a different directory so you have to change your current directory. Some command is already running in terminal <%= bashCommand.terminalId; %> to stop the execution just use this command 
`cd <%= bashCommand.path; %> `{{execute T<%= bashCommand.terminalId; %> interrupt}} <% }} else{%>
<% if(bashCommand.changeDir){%>We want to execute the command in a different directory so you have to change your current directory.
With the next command we also open a new terminal, so you have to execute the command twice 
`cd <%= bashCommand.path; %> `{{execute T<%= bashCommand.terminalId; %>}}. <% } %><% } %>

<% if(bashCommand.interrupt){ %><% if(bashCommand.changeDir){%>Run <%= bashCommand.name; %> with this bash-command.`<%= bashCommand.name; %> <%= bashCommand.args; %>`{{execute T<%= bashCommand.terminalId; %>}} <% } else{%> Some command is already running in terminal <%= bashCommand.terminalId; %>. Rerun the command to stop and relaunch it automatically. `<%= bashCommand.name; %> <%= bashCommand.args; %>`{{execute T<%= bashCommand.terminalId; %> interrupt }} <%} }else{ %>Run <%= bashCommand.name; %> with this bash-command.
`<%= bashCommand.name; %> <%= bashCommand.args; %>`{{execute T<%= bashCommand.terminalId; %>}} <%} %>

<%= textAfter; %>

