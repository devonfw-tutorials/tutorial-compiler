<%= text; %>

## Docker Compose

<%= cdCommand; %>

<% if(!interrupt){ %>
Now run docker-compose.
<% } else { %>
The docker container is already running.
<% } %> 

`<% if(useDevonCommand){ %>devon<% } %> docker-compose up`{{execute T<%= terminalId; %> <% if (interrupt) { %>interrupt<% } %>}}

This will take some time.

<% if(port){ %>
Then you can open the following link to use the app. 
https://[[HOST_SUBDOMAIN]]-<%= port %>-[[KATACODA_HOST]].environments.katacoda.com/
<% } %> 
<%= textAfter; %>