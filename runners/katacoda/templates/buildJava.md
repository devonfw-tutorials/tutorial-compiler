<%= text; %>

<%= cdCommand; %>
 
Use the following devon command to build the java project.

`<% if(useDevonCommand){ %>devon<% } %> mvn clean install <%= skipTest; %>`{{execute}}

The maven command 'clean' will clear the target directory beforehand. 

<%= skipTestDescr; %>

<%= textAfter; %>