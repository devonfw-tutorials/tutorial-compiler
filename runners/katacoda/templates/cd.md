<% if(terminalId) { %>
Now you have to open another terminal. Click on the cd command twice and you will change to '<%= dir; %>' in terminal <%= terminalId; %> automatically. Alternatively you can click on the + next to 'IDE', choose the option 'Open New Terminal' and run the cd command afterwards. 
<% } else { %>Please change the folder to '<%= dir; %>'.<% } %>

`cd <%= dir; %>`{{execute <%= terminal; %>}}