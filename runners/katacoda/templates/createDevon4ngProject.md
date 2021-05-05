<%= text; %>

<%= cdCommand; %>

<% if(useDevonCommand){ %>
Use the 'ng create' command to create a new Angular project with the name <%= projectName; %>.
`devon ng create <%= projectName; %><% if(params){ %> <%= params; %><% } %>`{{execute T1}}
<% } else { %>
Use the ng new command to create a new Angular project with the name <%= projectName; %>.
`ng new <%= projectName; %><% if(params){ %> <%= params; %><% } %>`{{execute T1}}
<% } %>

<%= textAfter; %>