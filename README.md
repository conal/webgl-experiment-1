This project is an experiment with WebGL, toward resurrecting [Shady](https://github.com/conal/shady-gen).

See [the demo](http://conal.github.io/webgl-experiment-1/).

Tested under:

*   Firefox 35.0.1:
    Seems to work okay.
    Console shows "Exceeded 16 live WebGL contexts for this principal, losing the least recently used one."
*   Safari 7.1.3:
    "getUserMedia not supported in this browser", so webcam examples don't work.
*   Chrome 40.0.2214.111 (64-bit).

## Directions

*   If running locally, start up a web server.
    I `cd` to the project directory and do "`python -m SimpleHTTPServer`".
    This requirement comes from how we load effects.
*   View http://localhost:8000 in a browser.

## Bugs

*   When the thumbnails page contains more than one webcam demo, only one works.
    Maybe one is clobbering the other, via a bug related to JS scoping.
    Oh! It works in Chrome, after asking a second time for camera access.
*   It's tedious to keep re-approving camera access.
*   Video aspect ratio doesn't get preserved.

## Other issues

*   "Error: WebGL: Drawing to a destination rect smaller than the viewport rect."
    I think I can fix by using two independent scaling factors for X and Y, rather than the single factor I have now.

## To do

*   Generate shaders and widgets from Haskell via Shady and [tangible values](http://www.haskell.org/haskellwiki/TV).
*   Load images.
*   3D, preferably with dynamic tessellation.

## Updates

*   2014-02-13:
    *   Use [Touch Punch](http://touchpunch.furf.com/) so that sliders work on touch-based devices, including iOS.
        I haven't tested with Android.
        If you try it, please let me know.
        I first tried [jQuery mobile](http://jquerymobile.com/), but the graphics get hidden behind a big white area.
    *   With input widgets, rendering no longer slows down over time.
    *   Display frames/second (FPS), in part to verify the progressive slow-down and the fix (when I find it).
        Inserted in element with id of "fps", if present and if animated.
        Used in effect.html (full-window effect) but not index.html (thumbnails).

