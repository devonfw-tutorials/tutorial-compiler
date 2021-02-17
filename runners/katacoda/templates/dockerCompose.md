<%= text; %>

<%= cdCommand; %>

<% if(!interrupt){ %>
Now run docker-compose.
<% } else { %>
The docker container is already running.
Usually you would type 'Ctrl + C' and rerun the same command in this terminal to rebuild the app, but for now click on the command to stop and relaunch it automatically.
<% } %> 

`docker-compose up`{{execute T<%= terminalId; %> <% if (interrupt) { %>interrupt<% } %>}}

This will take some time.

<% if(port){ %>
Then you can open the following link to use the app. 
https://[[HOST_SUBDOMAIN]]-<%= port %>-[[KATACODA_HOST]].environments.katacoda.com/
<% } %> 
<%= textAfter; %>