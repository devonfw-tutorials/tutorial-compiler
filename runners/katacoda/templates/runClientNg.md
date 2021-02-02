<%= text; %>
<%= cdCommand; %>

<% if(!interrupt){ %>
Now build and start the app
<% } else { %>
The Angular app is already running. 
Usually you would type "Ctrl + C" and rerun the same command in this terminal to rebuild the app, but for now click on the command to stop and relaunch it automatically.
<% } %> 

`<% if(useDevonCommand){ %>devon<% } %> ng serve --host 0.0.0.0 --disable-host-check`{{execute T<%= terminalId; %> <% if (interrupt) { %>interrupt<% } %>}}

For your local projects you wouldn't add '--host 0.0.0.0' and '--disable-host-check' to the ng command.

Now you can open the following link to use the app. 
https://[[HOST_SUBDOMAIN]]-4200-[[KATACODA_HOST]].environments.katacoda.com/

<%= textAfter; %>