// Seeded My List and Continue Watching, one bucket per persona id. Every objectID
// below was verified present in `media_ns` with both a poster and a backdrop, so
// the Continue Watching rail has a landscape still for each of its titles.
//
// No `anonymous` or `realtime` bucket on purpose: in the two modes that run without
// a persona the rails start empty and fill only from what the viewer adds or presses
// Play on, which is what makes picking a profile visibly do something.

import type { MediaWatchSeedMap } from '@/stores/mediaWatchState'

export const WATCH_STATE_SEEDS: MediaWatchSeedMap = {
  'marvel-fan': {
    myList: [
      'movie_299534', // Avengers: Endgame
      'show_84958', // Loki
      'movie_634649', // Spider-Man: No Way Home
      'movie_533535', // Deadpool & Wolverine
      'show_85271', // WandaVision
      'movie_284053', // Thor: Ragnarok
      'movie_283995', // Guardians of the Galaxy Vol. 2
    ],
    continueWatching: [
      { objectID: 'movie_299536', progress: 0.62 }, // Avengers: Infinity War
      { objectID: 'show_91363', progress: 0.34 }, // What If...?
      { objectID: 'movie_1726', progress: 0.81 }, // Iron Man
      { objectID: 'show_92749', progress: 0.15 }, // Moon Knight
      { objectID: 'movie_24428', progress: 0.47 }, // The Avengers
    ],
  },
  'kids-family': {
    myList: [
      'movie_269149', // Zootopia
      'movie_10681', // WALL·E
      'show_40075', // Gravity Falls
      'movie_568124', // Encanto
      'movie_177572', // Big Hero 6
      'movie_10191', // How to Train Your Dragon
      'show_63401', // We Bare Bears
    ],
    continueWatching: [
      { objectID: 'movie_803796', progress: 0.55 }, // KPop Demon Hunters
      { objectID: 'movie_862', progress: 0.28 }, // Toy Story
      { objectID: 'show_1877', progress: 0.72 }, // Phineas and Ferb
      { objectID: 'movie_14160', progress: 0.09 }, // Up
      { objectID: 'movie_502356', progress: 0.44 }, // The Super Mario Bros. Movie
    ],
  },
}
