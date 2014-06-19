# jQuery anonymousLists plugin

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

So, if you have a template or master page with an empty div, which is present across your entire site, with that single line, your users can have a history of their visits and searches within your site. But what if you want to display the history only in a single page or you want to keep history of a page without displaying a history tab? Then you need to use the tabsHolder method. With that method, if the specified div is found, then that div will be used for displaying the history. If not, the history will be still tracked, but won’t be displayed in the particular page.

    var hist = tabsHolder("#history").anonymousLists();

Now that we got the basic history tab off the way, let’s see an example with more lists. Let’s see how we can add a favorites tab and add some favorites to it. Of course, unlike in the example below, in a real website the values of title, url and info won’t be hardcoded, but variables that will get their values after a click (like).

     var hist = tabsHolder("#history").anonymousLists({
            id: "anonLists",
            lists: ["History", "Favorites"]
     });
     
     // You can add a list item by passing its values to the addTolist method
     hist.anonymousLists("addToList", "Favorites", 
            "American Hustle", 
            "http://www.imdb.com/title/tt1800241/?ref_=nv_sr_1", 
            "Christian Bale, Amy Adams, Bradley Cooper");
     
     // Or you can create a list item and then, pass it to the addItemToList method
     var movie = {
            title: "The Wolf of Wall Street",
            url: "http://www.imdb.com/title/tt0993846/?ref_=nv_sr_1",
            info: "Leonardo DiCaprio, Jonah Hill, Margot Robbie"
     };
     
     hist.anonymousLists("addItemToList", "Favorites", movie);
     
     movie = {
            title: "Heat",
            url: "http://www.imdb.com/title/tt0113277/?ref_=nv_sr_4",
            info: "Al Pacino, Robert De Niro, Val Kilmer"
     };
     
     hist.anonymousLists("addItemToList", "Favorites", movie);

The above js creates a history and a favorites tab and adds to the favorites the 3 selected movies. For adding them we used 2 plugin methods, the addToList and the addItemToList. Both work the same and the choice is just a matter of style.

There various settings for changing the functionality and look of our tabs and we can even change the HTML of our lists' items. You can find more information and examples on http://codebits.weebly.com/plugins/category/anonymouslists-plugin. Additionally, you can see a live implementation on http://codebits.weebly.com/movies.html.

# Future development and issues

Since anonymousLists plugin saves everything in cookies, it shouldn’t be used for long lists and heavy data. Cookies have a maximum size of 4KB, which isn’t that much, but is enough for comfortably keeping a history list of 20 links and a bigger number of favourites. In the movies page is used for keeping up to 100 items (movie titles). If you need to hold bigger lists, then you will need a database, which isn’t supported in the current release.

# MIT Licence

Copyright (c) 2014 Dimitris Kotsakis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.