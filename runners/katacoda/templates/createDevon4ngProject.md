<%= text; %>

<%= cdCommand; %>

<% if(useDevonCommand){ %>
Use the ng create command to create a new Angular Project with the name <%= projectName; %>.
`devon ng create <%= projectName; %> `{{execute T1}}
<% } else { %>
Use the ng new command to create a new Angular Project with the name <%= projectName; %>.
`ng new <%= projectName; %>`{{execute T1}}
<% } %>

<%= textAfter; %>