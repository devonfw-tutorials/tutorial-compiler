<%= text; %>

<%= cdCommand; %>
 
Use the following command to build the java project.

`mvn clean install <%= skipTest; %>`{{execute}}

The maven command 'clean' will clear the target directory beforehand. 

<%= skipTestDescr; %>

<%= textAfter; %>