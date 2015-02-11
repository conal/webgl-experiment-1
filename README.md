Some experiments with WebGL, toward resurrecting Shady.

Tested under:

*   Firefox 35.0.1:
    Seems to work okay.
    Console shows "Exceeded 16 live WebGL contexts for this principal, losing the least recently used one."
*   Safari 7.1.3:
    "getUserMedia not supported in this browser", so webcam examples don't work.
*   Chrome 40.0.2214.111 (64-bit).

Directions:

*   View index.html in a browser.

## Bugs

*   When the thumbnails page contains more than one webcam demo, only one works.
    Maybe one is clobbering the other, via a bug related to JS scoping.

