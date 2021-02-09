<%= text; %>

<%= cdCommand; %>
 
Use the following devon command to build the java project.

`<% if(useDevonCommand){ %>devon <% } %>mvn clean install<% if(skipTest){ %> -Dmaven.test.skip=true<% } %>`{{execute}}

The maven command 'clean' will clear the target directory beforehand. 

<% if(skipTest){ %>We do not need to execute the test cases, so we can skip them by using the option '-Dmaven.test.skip=true'.<% } %>

<%= textAfter; %>