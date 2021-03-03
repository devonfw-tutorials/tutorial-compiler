<%= text; %>

<%= cdCommand; %>

<% if(npmCommand.name){ %>
Install the package <%= npmCommand.name; %><% if(!npmCommand.global){ %> and add it to the dependencies<% } %>.<% } else {%>
Install the dependencies from the package.json file.<% } %>

`<% if(useDevonCommand){ %>devon <% } %>npm install<% if(npmCommand.global){ %> -g<% } %> <%= npmCommand.args; %> <%= npmCommand.name; %>`{{execute T1}}

<% if(npmCommand.global){ %>Due to the argument '-g' the package will be installed globally.<% } %>
This may take some time.

<%= textAfter; %>