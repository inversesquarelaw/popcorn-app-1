App.TorrentProviders = App.TorrentProviders || {};

var token = null;
var uid = null;

var url = 'http://api.t411.me/';

console.log(token, uid);

// Authenticate user
var authenticate = function(callback) {
    var creds = {
        username: localStorage.t411_username,
        password: localStorage.t411_password
    };
    $.post(url + 'auth', creds, function(data) {
        if(!data.error) {
            token = data.token;
            uid = data.uid;
            console.log('Auth', arguments);
            callback();
        } else {
            alert('Authentication to t411 failed');
        }
    }, 'json');
};

var isAuthenticated = function() {
    return token !== null && uid !== null;
};


App.TorrentProviders.t411 = function (options) {
    var apiUrl = url;

    var supportedLanguages = ['english', 'french', 'dutch', 'portuguese', 'romanian', 'spanish', 'turkish', 'brazilian', 'italian', 'german'];

    /*if (options.genre) {
        url += options.genre.toLowerCase() + '.json';
    } else {
        if (options.keywords) {
            url += 'search.json?query=' + options.keywords;
        } else {
            url += 'torrents/top/100';
        }
    }

    if (options.page && options.page.match(/\d+/)) {
        var str = url.match(/\?/) ? '&' : '?';
        url += str + 'page=' + options.page;
    }*/

    apiUrl += 'torrents/top/100';

    var MovieTorrentCollection = Backbone.Collection.extend({
        url: apiUrl,
        model: App.Model.Movie,
        fetch: function(options) {
            options = _.defaults(options || {}, {headers:{}});
            _.extend(options.headers, {Authorization: token});

            var originalFetch = Backbone.Collection.prototype.fetch;
            var self = this;

            if ( !isAuthenticated() ) {
                authenticate(function(){
                    self.fetch(options);
                });
            } else {
                return originalFetch.call(self, options);
            }
        },
        parse: function (data) {
            movies = [];
            data.forEach(function(movie){
                movies.push({

                    imdb:       "",
                    title:      movie.name,
                    year:       movie.added.substring(0,4),
                    runtime:    0,
                    synopsis:   "",
                    voteAverage:0,

                    image:      "",
                    bigImage:   "",
                    backdrop:   "",

                    quality:    '720p',
                    torrent:    'http://api.t411.me/torrents/download/' + movie.id,
                    torrents:   {'720p': 'http://api.t411.me/torrents/download/' + movie.id},
                    videos:     {},
                    subtitles:  {},
                    seeders:    movie.seeders,
                    leechers:   movie.leechers,
                    request:    {
                        headers: {Authorization: token}
                    }
                });
            });
            return movies;
        }
    });

    return new MovieTorrentCollection();
};
