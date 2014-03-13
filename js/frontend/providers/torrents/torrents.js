var provider = localStorage.torrent_provider || 'subapi';
App.getTorrentsCollection = App.TorrentProviders[provider];