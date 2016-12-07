import { assign } from 'lodash'
import isMobile from 'ismobilejs'

import { http } from '../services';
import { userStore, preferenceStore, artistStore, songStore, playlistStore, queueStore, settingStore, folderStore, genreStore } from '.';

export const sharedStore = {
  state: {
    songs: [],
    albums: [],
    artists: [],
    genres: [],
    favorites: [],
    queued: [],
    interactions: [],
    users: [],
    settings: [],
    songsSelection: [],
    currentUser: null,
    playlists: [],
    useLastfm: false,
    useYouTube: false,
    useiTunes: false,
    allowDownload: false,
    currentVersion: '',
    latestVersion: '',
    cdnUrl: '',
    originalMediaPath: ''
  },

  init () {
    folderStore.reset()
    return new Promise((resolve, reject) => {
      http.get('data', ({ data }) => {
        assign(this.state, data)
        // Don't allow downloading on mobile devices
        this.state.allowDownload = this.state.allowDownload && !isMobile.any

        // Always disable YouTube integration on mobile.
        this.state.useYouTube = this.state.useYouTube && !isMobile.phone

        // If this is a new user, initialize his preferences to be an empty object.
        if (!this.state.currentUser.preferences) {
          this.state.currentUser.preferences = {}
        }

        userStore.init(this.state.users, this.state.currentUser)
        preferenceStore.init(this.state.preferences)
        genreStore.init(this.state.genres) // Must be done before initializing songs.
        artistStore.init(this.state.artists) // This will init album and song stores as well.
        songStore.initInteractions(this.state.interactions)
        playlistStore.init(this.state.playlists)
        queueStore.init()
        settingStore.init(this.state.settings)

        // Keep a copy of the media path. We'll need this to properly warn the user later.
        this.state.originalMediaPath = this.state.settings.media_path

        resolve(this.state)
      }, error => reject(error))
    })
  }
}
