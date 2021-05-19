<% if(terminalId) { %>
Now you have to open another terminal. Click on the cd command twice and you will change to '<%= dir; %>' in terminal <%= terminalId; %> automatically. The first click will open a new terminal and the second one will change the directory. Alternatively you can click on the '+', choose the option 'Open New Terminal' and run the cd command afterwards. 
<% } else { %>Please change the folder to '<%= dir; %>'.<% } %>

`cd <%= dir; %>`{{execute <%= terminal; %>}}