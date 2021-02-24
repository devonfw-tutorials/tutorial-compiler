<%= text; %>

<%= cdCommand; %>

<% if(packageName){ %>
Install the package <%= packageName; %><% if(!global){ %> and add it to the dependencies<% } %>.<% } else {%>
Install the dependencies from the package.json file.<% } %>

`<% if(useDevonCommand){ %>devon<% } %> npm install<% if(global){ %> -g<% } %><% if(packageArgs){ %> <%= packageArgs; %><% } %><% if(packageName){ %> <%= packageName; %><% } %>`{{execute T1}}

<% if(global){ %>Due to the argument '-g' the package will be installed globally.<% } %>
This may take some time.

<%= textAfter; %>