<%= text; %>

<%= cdCommand; %>

<% if (directoryPath) { %>
If the parent directories aren't already in the project, 'mkdir -p' will create them for you. 

`mkdir -p <%= directoryPath; %>`{{execute}}

`cd  <%= directoryPath; %>`{{execute}}
<% } %>

Now clone the repository to your local directory.

`git clone <%= repository; %>`{{execute}}

<%= textAfter; %>