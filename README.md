# AnonymousLists a jQuery plugin for unregistered users

AnonymousLists is a jQuery plugin for keeping the history and favourites of unregistered users. It doesn’t need a database, since it keeps all the data into cookies. The lists are displayed in tabular format and you can customize their look through settings and CSS. In addition to CSS, you can change the inner html of each list item. You can have more than one anonymousLists in each page, with each one working separately and consisting of one or more lists.

# Instalation

Download plugin's files and then, include them to your pages, along with the jQuery lib.

    <link rel="Stylesheet" href="styles/cleanslate.css" />
    <link rel="Stylesheet" href="styles/jquery.anonymousLists.css" />
    <script src="http://code.jquery.com/jquery-latest.min.js"></script>
    <script src="scripts/jquery.anonymousLists.min.js"></script>

# Example use

To add a history tab to a page with a div with id "history" use the following line:

    $("#history").anonymousLists();

![$("#history").anonymousLists();](../../../Desktop/Projects/JavaScript%20Projects/tabularLists/media/Screenshots/anonLists_default.png)