Some experiments with WebGL, toward resurrecting Shady.

See [the demo](http://conal.github.io/webgl-experiment-1/).

Tested under:

*   Firefox 35.0.1:
    Seems to work okay.
    Console shows "Exceeded 16 live WebGL contexts for this principal, losing the least recently used one."
*   Safari 7.1.3:
    "getUserMedia not supported in this browser", so webcam examples don't work.
*   Chrome 40.0.2214.111 (64-bit).

Directions:

*   If running locally, start up a web server.
    I `cd` to the project directory and do "`python -m SimpleHTTPServer`".
    This requirement comes from how we load effects.
*   View http://localhost:8000 in a browser.

## Bugs

*   When the thumbnails page contains more than one webcam demo, only one works.
    Maybe one is clobbering the other, via a bug related to JS scoping.
    Oh! It works in Chrome, after asking a second time for camera access.
*   It's tedious to keep re-approving camera access.
*   Rendering seems to slow down over time, especially with video.

