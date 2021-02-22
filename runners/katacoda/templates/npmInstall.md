<%= text; %>

<%= cdCommand; %>

<% if(packageName){ %>
Install the package <%= packageName; %> and add it to the dependencies.<% } else {%>
Install the dependencies from the package.json file.<% } %>

`<% if(useDevonCommand){ %>devon<% } %> npm install<% if(global){ %> -g <% } %><%= packageArgs; %> <%= packageName; %>`{{execute T1}}

This may take some time.

<%= textAfter; %>