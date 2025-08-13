/* Local worker wrapper for Stockfish.
   Keeps the Worker URL same-origin (./stockfish.js) so browsers allow it,
   while loading the real engine code from a trusted CDN. */
importScripts('https://cdn.jsdelivr.net/gh/niklasf/stockfish.js/src/stockfish.js');
