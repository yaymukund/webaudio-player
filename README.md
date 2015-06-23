# webaudio-player

A simple webaudio player that fetches and plays songs. To fetch songs, it
uses `XMLHttpRequest`.

```js
// Installation
import { configure } from 'settings';
configure({ RSVP: RSVP });

// Usage
let player = new Player();
player.play('http://localhost:4200/test.mp3');
```

## `Player`

A player instance exposes the following methods:

```js
pause()
unpause()
isPaused()
setVolume(volume) // a Number from 0-1.
getVolume(volume)
mute()
unmute()
preload(url)
getSeconds() // how many seconds have been played?
getDuration() // how many seconds in the current track?
seekToPercent(percent) // a Number from 0-1
on(name, fn) // only `ended` event is supported.
```

`preload` tracks to avoid any pauses between tracks.

## TODO

- [ ] support any promises library
- [ ] test skipless playback using `<audio>`
- [ ] let the user configure preload cache size
- [ ] `preload` returns a `Promise` instance
- [ ] support overriding `XMLHttpRequest`*

* evaluate if this is even worth it given the webaudio api's
  browser support.
