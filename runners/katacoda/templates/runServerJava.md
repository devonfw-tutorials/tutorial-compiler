<%= cdCommand; %>
<% if(!interrupt){ %>
Start the server in terminal <%= terminalId; %> by running the maven command 'mvn spring-boot:run'.

Because this terminal runs the server we will not use it for any other command.
<% } else { %>
The server is already running. Rerun the command to stop and relaunch it automatically.
<% } %> 

`mvn spring-boot:run`{{execute T<%= terminalId; %> <% if (interrupt) { %>interrupt<% } %>}}

This will take some time.

<%= textAfter; %>