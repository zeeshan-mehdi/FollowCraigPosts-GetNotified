// var url = "http://anyorigin.com/go?url=" + encodeURIComponent("https://sfbay.craigslist.org/") +  "&callback=?";
// $.get(url, function(response) {
//   console.log(response);
// });


var btn = document.getElementById('btn');

var list = document.getElementById('list');

var domain = 'https://sfbay.craigslist.org';

var notificationIds ={};


getWebsitecontent();

var followedCategories = [];


var categories = [];

class Categories {
    constructor(title, link, following, firstPost, postLink) {
        this.title = title;
        this.link = link;
        this.following = following;
        this.firstPost = firstPost;

        this.postLink = postLink;
    }
}


//setInterval(keepChecking,500*60);

function getWebsitecontent() {

    categories = fetchCetogriesFromDB();
    console.log(categories)

    if (!isEmpty(categories)) {
        console.log('inside');
        $.get(domain, function (response) {
            categories = [];
            console.log(response);

            var elements = $(response);
            var found = $('.col', elements);

            var h4 = $('.ban', found);

            var spans = $('.txt', h4);

            var links = $('a', h4);





            var spansArray = spans.toArray();

            console.log(spansArray);

            for (var i = 0; i < links.toArray().length; i++) {
                var title = spansArray[i];

                var link = links.toArray()[i];

                var category = new Categories(title.innerText, link.attributes.getNamedItem('href').value, false);
                categories.push(category);
            }


            categories.forEach(element => {
                var li = document.createElement("button");
                //li.appendChild(document.createTextNode(element.title));


                if (!element.following)
                    li.appendChild(document.createTextNode('Follow ' + element.title));
                else
                    li.appendChild(document.createTextNode('UnFollow ' + element.title));

                list.appendChild(li);
                console.log(element);
            });

            $('button').addClass('btn');


            $('button').click(function () {

                var txt = $(this).html();

                //alert(txt);

                var c;

                if (txt.toLowerCase().includes('unfollow')) {
                    txt = txt.replace(/unfollow/gi, 'follow');
                    c = extractCategory(txt);
                } else {
                    txt = txt.replace(/follow/gi, 'unfollow');
                    c = extractCategory(txt);
                }
                $(this).html(txt);


                console.log(c);
                addCategory(categories, c);
                followCategory(categories, domain);

            });

            // $('button').css('margin','10px');
            // $('button').css('padding','5px');

        });
    } else {
        console.log('outside');

        var list2 = document.getElementById('list');
        categories.forEach(element => {
            var li = document.createElement("button");
            //li.appendChild(document.createTextNode(element.title));


            if (!element.following)
                li.appendChild(document.createTextNode('Follow ' + element.title));
            else
                li.appendChild(document.createTextNode('UnFollow ' + element.title));

            list2.appendChild(li);
            console.log(element);
        });

        $('button').addClass('btn');


        $('button').click(function () {

            var txt = $(this).html();

            //alert(txt);

            var c;

            if (txt.toLowerCase().includes('unfollow')) {
                txt = txt.replace(/unfollow/gi, 'follow');
                c = extractCategory(txt);
            } else {
                txt = txt.replace(/follow/gi, 'unfollow');
                c = extractCategory(txt);
            }


            $(this).html(txt);

            console.log(c);
            addCategory(categories, c);

            followCategory(categories, domain);

        });

        // $('button').css('margin','10px');
        // $('button').css('padding','5px');



    }



}

function isEmpty(obj) {

    if (obj === null)
        return false;
    return true;
}

function extractCategory(txt) {
    if (txt.toLowerCase().includes('unfollow'))
        txt = txt.replace(/unfollow/gi, '');
    else
        txt = txt.replace(/follow/gi, '');

    return txt;
}



function fetchNoOfPosts(url, c) {
    $.get(url, function (response) {
        //console.log(response);

        console.log($('.totalcount', response));

        var res = $('.totalcount', response).toArray();

        var noOfPosts = $(res[0]).text();
        console.log(noOfPosts);

        fetchPost($('.result-row', response), c);



        //console.log()

    });
}


function addCategory(cats, c) {

    //console.log(cats);

    // cats.toArray().forEach(el){
    //     console.log(c);
    // }

    for (var i = 0; i < cats.length; i++) {

        console.log(cats[i].title);
        if (cats[i].title === c.trim()) {
            console.log('category followed ');
            cats[i].following = true;
        }
    }
}

function fetchPost(li, c) {
    var firstPost = li.toArray()[0];

    //console.log(firstPost);
    //return;

    var title = $('.result-title', firstPost).text();

    var link = $('.result-title.hdrlnk', firstPost);
    var link2 = link.toArray()[0].attributes.getNamedItem('href').value;

    console.log(title);

    console.log(link2);

    categories[c].firstPost = title;
    categories[c].postLink = link2;

    window.localStorage.setItem('category', JSON.stringify(categories));
    //notifyMe("New Post Added ...", title, link2);

    //sendNotification();

}

function keepChecking() {


    var baseUrl = 'https://sfbay.craigslist.org';


    if (categories !== null) {
        for (var i = 0; i < categories.length; i++) {

            if (categories[i].following) {
                //alert('checking ....');
                isNewPostAdded(baseUrl + categories[i].link, categories[i].title, i);
            }
        }
    } else {
        categories = fetchCetogriesFromDB();
       //alert('categories are null');
    }
}

function isNewPostAdded(url, post, c) {

    $.get(url, function (response) {

        //alert('i am here');
        console.log($('.totalcount', response));

        var res = $('.totalcount', response).toArray();

        var noOfPosts = $(res[0]).text();

        var li = $('.result-row', response);

        var firstPost = li.toArray()[0];

        var title = $('.result-title', firstPost).text();

        var link = $('.result-title.hdrlnk', firstPost);
        var link2 = link.toArray()[0].attributes.getNamedItem('href').value;

       // alert(title);

        console.log(link2);
        if (categories[c].firstPost !== title) {
            categories[c].firstPost = title;
            categories[c].postLink = link2;
            //alert('matched .......');

            window.localStorage.setItem('category', JSON.stringify(categories));

            notifyMe('Craig New Post Added On Category You are Following ..', title, link2);
        } else {
           // alert('not matched');
        }

    });
}


function followCategory(c, domain) {


    for (var i = 0; i < c.length; i++) {
        if (c[i].following)
            fetchNoOfPosts(domain + c[i].link, i);
    }

    console.log('follwong categories ' + c);
}

function fetchCetogriesFromDB() {
    return JSON.parse(window.localStorage.getItem('category'));

}

function notifyMe(title2, body, link) {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission(function (permission) {

            // Whatever the user answers, we make sure we store the information
            if (!('permission' in Notification)) {
                Notification.permission = permission;
            }

            // If the user is okay, let's create a notification
            if (permission === "granted") {
                var notification = new Notification("Hi there!");
            }
        });

        //notifyMe(title, link, body);
    } else {
        var forumUrl = link;
        var options = {
            type: "basic",
            title: title2,
            message: body,
            iconUrl: "bmi.png"
        }

        // create notification using forumUrl as id
        chrome.notifications.create(forumUrl, options, function (notificationId) {

            localStorage.setItem(notificationId,forumUrl);
           // notificationIds[notificationId]=forumUrl;
        });

        // create a on Click listener for notifications
        chrome.notifications.onClicked.addListener(function (notificationId) {
            chrome.tabs.create({
                url: localStorage.getItem(notificationId)
            });
        });

    }

}


document.addEventListener('DOMContentLoaded', function () {
    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }

    if (Notification.permission !== 'granted')
        Notification.requestPermission(function (permission) {

            // Whatever the user answers, we make sure we store the information
            if (!('permission' in Notification)) {
                Notification.permission = permission;
            }

            // If the user is okay, let's create a notification
            if (permission === "granted") {
                var notification = new Notification("Congrats Notifications Enabled ....");
            }
        });
});

// function sendNotification() {
//     var noti = NotificationOptions();

//     noti.title = "hello";
//     noti.body = "body";
//     noti.icon = "http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png";

//     noti.onclick = function () {
//         window.open('http://stackoverflow.com/a/13328397/1269037');
//     };





//     chrome.notifications.create("hello", options, function () {
//         console.log('call back');
//     });
// }
