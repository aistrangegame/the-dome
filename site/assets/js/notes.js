/* The notes: a behind-the-scenes guide for Eric and Mona, written into every page.
   Turned on from the "Notes" button (or ?notes=1 in the address), it adds:
   · a card for the page: what it is for, who it is for, where its words come from, what it connects to
   · a numbered note before each part of the page
   · the whole house: every page in its layer, with this one lit
   Content only. The behaviour lives in dome.js (notes()). */
window.DOME_NOTES = (function () {
  const LAYERS = [
    { k: "door", name: "The Door", line: "The public site. Anyone can find it. Eric and Mona speak here, with guests’ own words.",
      pages: ["index.html", "places/index.html", "places/window.html", "stories.html", "timeline.html", "ideas.html", "around.html", "how-it-began.html", "the-new-chapter.html", "stay.html", "your-stays.html"] },
    { k: "point", name: "Behind the point", line: "The dome’s own room, opened from the point in the top-left corner. The dome tells its story and plays three games.",
      pages: ["play/index.html", "play/story.html", "play/find.html", "play/build.html", "play/still.html"] },
    { k: "house", name: "The House", line: "Only on the mountain. Guests reach it from the QR card at each place. The dome speaks here.",
      pages: ["house/index.html", "house/places/window.html", "house/awakening/index.html", "house/awakening/act-1.html", "house/choose/index.html"] },
    { k: "keeping", name: "The Keeping", line: "Eric and Mona’s side: prices, bookings, guests’ words, ideas and photos.",
      pages: ["dashboard/index.html"] }
  ];

  // Where things live. Named once, used in many notes.
  const SRC = {
    data: "dome-data.js: the one content file (places, stories, timeline, ideas, prices). Becomes Airtable when the Worker is live.",
    reviews: "Airtable · Reviews: all 252 guest reviews, quoted word for word with first name and number.",
    places: "Airtable · Places: the 13 places, their lines, their one thing to do.",
    media: "Airtable · Media: every photo and film clip, its season, and whether the photographer or an unknown person is in it (those are never used).",
    ideas: "Airtable · Ideas: each idea a guest left, who left it, and whether it’s heard, planned or built.",
    slots: "Marked slots: dashed boxes where Eric and Mona’s (or Cody and Nicole’s) own words will go. The text inside is a stand-in.",
    booking: "The Worker (Cloudflare) holds the calendar and takes payment through Stripe. Until it is live, booking runs on this device only.",
    device: "Kept on the guest’s phone only. Nothing here is sent anywhere."
  };

  const P = {
    "index.html": { layer: "door", title: "Home",
      purpose: "The first thing anyone sees. It has to say, in a few seconds, what the dome is and how it feels, and then make booking easy.",
      who: "Future guests, mostly arriving from Instagram, search or a friend’s link.",
      data: [SRC.data, SRC.reviews, SRC.slots], links: ["places/index.html", "stories.html", "stay.html", "play/index.html"],
      later: "The season the site opens in follows today’s date. Eric and Mona’s welcome replaces the marked slot.",
      sections: [
        { sel: "section.bloom", t: "The opening", x: "A single point opens into a circle as you scroll, and inside it the drone comes down from the whole property, past the dome, all the way to a guest waving up from the cedar pool. Your scrolling drives the film: scroll back up and it rises again.", d: "Drone clip DJI_20260801165035_0293, Aug 1 2026, the whole clip played in reverse." },
        { sel: "section.band:has([data-slot-key='em_welcome']), section.band:has(.slot)", t: "Welcome", x: "The seed line, Under the same sky, then Eric and Mona’s welcome in a marked slot and the two main ways in: dates, or the places." },
        { sel: "section.passage[data-mode='open']", t: "Passages", x: "Between parts of the page a photo opens in a circle and guests’ words appear over it. Every page uses these to move from one thing to the next." },
        { sel: "section.band:has(#placeCards)", t: "Six of the thirteen places", x: "Each card opens a place page. The little moving icon on each card acts out the place.", d: "Places from dome-data.js." },
        { sel: "section.band:has(#sky)", t: "The sky of guests", x: "One star for each of the 252 guests. Touch one to read what they wrote. Warmer stars are guests since April 2026.", d: SRC.reviews },
        { sel: "section.band:has(#seasonCards)", t: "Four domes", x: "Choosing a season changes the whole site: colours, photos and words. Where there’s no real photo from that season yet, the picture says Imagined.", d: SRC.media },
        { sel: "section.band.soft:has(a[href='stories.html'])", t: "Stories and ideas", x: "Doors to the stories (told only in guests’ words) and the ideas loop (guests ask, Eric and Mona build, the guest is credited)." },
        { sel: "body > section.band.deep:last-of-type, section.band.deep:has(a[href='stay.html'])", t: "Come and stay", x: "Every page ends by inviting you to stay. Booking is the one deep, dark band on each page." }
      ] },

    "places/index.html": { layer: "door", title: "The places",
      purpose: "Shows that the dome is not one room but thirteen places, each with its own story, guests’ words and one thing to do.",
      who: "Future guests deciding, and returning guests who remember a place.",
      data: [SRC.places, SRC.reviews, SRC.media], links: ["places/window.html", "house/places/window.html", "index.html"],
      later: "The same thirteen places are printed as QR cards on the property. The pin positions on the map are close but should be checked by Eric.",
      sections: [
        { sel: "section.passage", t: "The descent", x: "The camera comes down from the sky onto the dome, moving: the drone drifts high over the forest at evening. It sets up the map below.", d: "Drone clip DJI_20260802173317_0328, Aug 2 2026." },
        { sel: "section:has(#map)", t: "The living map", x: "The summer drone photo from straight above. Paths draw out from the dome to each place outside. Touch the dome and the seven places inside open in a ring around it. Touch any place to see its card below.", d: "Pin positions are set in this page and want Eric’s check." },
        { sel: "section.band.soft:has(#inside)", t: "Inside the dome", x: "Seven places inside: the window, couch, library wall, table, loft, hearth and the guest book table." },
        { sel: "section.band:has(#outside)", t: "Outside, on the mountain", x: "The gate, the cedar pool, the fire circle, the meadow, the trails and pond, the night sky." }
      ] },

    place: { layer: "door", title: "A place (public)", one: "places/window.html",
      purpose: "One page for each of the thirteen places, made from the same template. This is the public version, which anyone can read.",
      who: "Future guests, and guests who scan a place’s QR code before they arrive.",
      data: [SRC.places, SRC.reviews, SRC.slots], links: ["places/index.html", "house/places/window.html"],
      later: "Eric and Mona’s line for each place replaces the marked slot.",
      sections: [
        { sel: "#main > section.hero", t: "The place", x: "Its photo, number, name and its own moving icon. The photo changes with the season; Imagined means no real photo from that season yet." },
        { sel: "#main > section.band:has(.voices)", t: "What guests said here", x: "Three guests, quoted exactly, chosen because they wrote about this place.", d: SRC.reviews },
        { sel: "#main > section.band.soft:has(.slot)", t: "Eric and Mona’s line", x: "A marked slot for what they want to say about this place.", d: SRC.slots },
        { sel: "#main > section.band.deep", t: "One thing to do here", x: "One small act for this place. On the mountain this becomes the start of the place’s game." }
      ] },

    "house-place": { layer: "house", title: "A place (on the mountain)", one: "house/places/window.html",
      purpose: "What a guest sees after scanning the QR card at a place. The same place as the public page, but here the dome speaks, and the guest can leave something.",
      who: "Guests standing at the place, during their stay.",
      data: [SRC.places, SRC.reviews, "Words left here go to the dashboard (Guests’ words) and wait for Eric and Mona to approve them."], links: ["house/index.html", "house/awakening/index.html", "dashboard/index.html"],
      later: "Next step: each place becomes a played scene, with a story from guests who were here, a short film, and a game that fits the place.",
      sections: [
        { sel: "#main > section.hero", t: "The dome speaks", x: "Same place, but the dome’s own line sits under the name. The dome only speaks on the mountain and behind the point." },
        { sel: "#main > section.band:has(#leave)", t: "Leave something", x: "A line, a memory or an idea for the next guest. Nothing appears publicly until Eric and Mona approve it in the dashboard.", d: "Sent to the Worker (/words), mirrored to Airtable." },
        { sel: "#main > section.band.soft:has(a[href*='awakening'])", t: "The Awakening", x: "If this place holds an act of the Awakening, the door to it is here. Acts open in order." }
      ] },

    "stories.html": { layer: "door", title: "Stories",
      purpose: "Six stories told only in guests’ own words: the ones who came to celebrate, brought their dogs, came in the snow, brought children, came to stop, looked up.",
      who: "Future guests who want to picture themselves here.",
      data: [SRC.reviews, SRC.data], links: ["index.html", "timeline.html"],
      sections: [
        { sel: "section.hero", t: "Stories", x: "No marketing voice here. Each story is a thread of guests, each quoted exactly." },
        { sel: "#main > section.passage", t: "Between stories", x: "A photo opens between each story, the same passage move used across the site." }
      ] },

    "timeline.html": { layer: "door", title: "The living timeline",
      purpose: "The dome’s life from 2023 to now: first guests, the first winter, a proposal, the handover in April 2026, and what comes next.",
      who: "Anyone curious; returning guests finding their own season.",
      data: [SRC.data, SRC.reviews, SRC.ideas, SRC.slots], links: ["ideas.html", "the-new-chapter.html", "how-it-began.html"],
      later: "When an idea is built, it appears here with the guest’s name.",
      sections: [
        { sel: "section.passage", t: "Into the timeline", x: "The camera comes down through the forest onto the dome." },
        { sel: "section.band:has(#tl)", t: "The entries", x: "Each entry is a guest moment (with their words), an idea a guest asked for, a turning point, or a marked slot for Eric and Mona or Cody and Nicole." }
      ] },

    "ideas.html": { layer: "door", title: "The ideas loop",
      purpose: "Shows that guests help build the dome: a guest asks, Eric and Mona build it, and the guest’s name goes on it.",
      who: "Future and returning guests.",
      data: [SRC.ideas, SRC.reviews], links: ["timeline.html", "dashboard/index.html", "house/places/window.html"],
      later: "Ideas left on the QR pages land in the dashboard; Eric and Mona move them from Heard to Planned to Built.",
      sections: [
        { sel: "section.band:has(#ideas)", t: "The ideas", x: "Each one with the guest’s own words and its status: Heard, Planned or Built." },
        { sel: "section.band.soft", t: "Have an idea?", x: "Points guests to the card at each place on the mountain, where ideas are left." }
      ] },

    "around.html": { layer: "door", title: "Around the mountain",
      purpose: "Where to eat, ski, walk and wander nearby, in groups.",
      who: "Guests planning their days.",
      data: ["The Cody guidebook (docs/guidebook-notes.md). Drive times follow the guidebook, to be checked on a map before going live.", SRC.reviews],
      links: ["stay.html"], sections: [
        { sel: "section.hero", t: "Around", x: "The groups: close by, eat and drink, snow, water and trails, further afield." },
        { sel: "section.passage", t: "The waterfall", x: "A drone flight under a road bridge to a waterfall, filmed the same summer weekend. The falls are deliberately not named until Eric confirms which they are.", d: "Drone clip DJI_20260801145457_0255, Aug 1 2026." },
        { sel: "section.band.soft", t: "From guests", x: "Guests’ own tips about the area, quoted exactly." }
      ] },

    "how-it-began.html": { layer: "door", title: "How it began",
      purpose: "Cody and Nicole’s chapter: they built the dome by hand and welcomed its first guests.",
      who: "Guests who loved the dome before; anyone curious about its making.",
      data: [SRC.reviews, SRC.slots], links: ["the-new-chapter.html", "house/choose/index.html"],
      later: "Eric and Mona will ask Cody and Nicole for their words; those replace the marked slots.",
      sections: [
        { sel: "section.band:has(.voices)", t: "What guests saw in their work", x: "Guests on the care in the place, quoted exactly. Cody and Nicole’s own account sits in a marked slot above." },
        { sel: "section.band.soft", t: "Their lines", x: "Slots for the place each loved and a line for future guests, then the door to the choice game." }
      ] },

    "the-new-chapter.html": { layer: "door", title: "The new chapter",
      purpose: "Eric and Mona, since April 2026: why they took on the dome and what they want it to be.",
      who: "Future guests getting to know the hosts.",
      data: [SRC.slots, SRC.reviews], links: ["how-it-began.html", "timeline.html", "stay.html"],
      later: "Almost everything here waits for Eric and Mona’s own words.",
      sections: [
        { sel: "section.hero", t: "The new chapter", x: "Their story, mostly in marked slots for now." },
        { sel: "section.band.deep", t: "The first guests of the new chapter", x: "Guests who have stayed since April 2026, quoted exactly." }
      ] },

    "stay.html": { layer: "door", title: "Stay",
      purpose: "Booking directly with Eric and Mona: choose nights, see the whole price with every fee and tax shown, hold the dates, pay.",
      who: "Guests ready to book.",
      data: [SRC.booking, "Prices set in the dashboard: base, season, weekend, and any single date."], links: ["your-stays.html", "dashboard/index.html"],
      later: "Live: Stripe Checkout takes the deposit (50%), the balance is charged before arrival, the door code arrives 24 to 48 hours ahead.",
      sections: [
        { sel: "section:has(#months)", t: "Nights, price, hold", x: "Open and booked nights with the price for each. Pick arrival and last morning (two nights minimum). The quote shows nightly prices, cleaning, 8% sales tax and 2% occupancy tax as separate lines. Then name and phone, and the dates are held for 35 minutes while paying." }
      ] },

    "your-stays.html": { layer: "door", title: "Your stays",
      purpose: "No accounts: a returning guest finds every stay, word and idea with their first name and the last four digits of their phone.",
      who: "Returning guests.",
      data: [SRC.booking], links: ["stay.html", "ideas.html"],
      later: "This is where a guest will see that their idea was built. That’s the moment the dome becomes home.",
      sections: [ { sel: "form#find", t: "Find my stays", x: "First name and last four digits. Live, the Worker checks it (/lookup)." } ] },

    "play/index.html": { layer: "point", title: "Behind the point",
      purpose: "The dome’s own room. The white point in the top-left corner of every page opens it.",
      who: "Anyone curious enough to touch the point.",
      data: ["The dome’s voice is written for these pages. Guests’ words are quoted exactly."], links: ["play/story.html", "play/find.html", "play/build.html", "play/still.html"],
      sections: [] },
    "play/story.html": { layer: "point", title: "The dome’s own story",
      purpose: "The dome tells its life in nine stages, from an empty hillside to 252 guests and a name of its own.",
      who: "Anyone who opened the point.",
      data: [SRC.reviews, SRC.slots], links: ["play/build.html", "play/find.html", "play/still.html", "stay.html"],
      sections: [
        { sel: "section.opening", t: "The dome speaks", x: "The only public pages where the dome speaks in the first person." },
        { sel: "#s2", t: "Raised by hand", x: "Cody and Nicole’s marked slot sits inside the dome’s telling." },
        { sel: "#s5", t: "Filling", x: "The count climbs to 252; the seasons are the real numbers." },
        { sel: "#s8", t: "My own name", x: "April 2026: Eric and Mona, and leaving the listing for a home of its own. Their marked slot is here." }
      ] },
    "play/find.html": { layer: "point", title: "Find the point",
      purpose: "A game: find the white dome in six drone photos, from high over the valley down to its own clearing.",
      who: "Anyone, especially on a phone.", data: ["Drone photos from the summer 2026 shoot; the dome’s position in each is set by hand in this page."],
      links: ["play/index.html", "stay.html"], sections: [] },
    "play/build.html": { layer: "point", title: "One triangle at a time",
      purpose: "A game: rebuild the dome from the ground up. Each triangle is one guest, in the order they stayed, coloured by season. The empty ones left at the end are for guests still to come.",
      who: "Anyone.", data: [SRC.reviews], links: ["play/index.html", "stay.html"], sections: [] },
    "play/still.html": { layer: "point", title: "Be still",
      purpose: "A game of not moving: each few seconds of stillness lights a star with a guest’s words about the night sky.",
      who: "Anyone, best at night.", data: [SRC.reviews], links: ["play/index.html", "places/night-sky.html"], sections: [] },

    "house/index.html": { layer: "house", title: "On the mountain",
      purpose: "The guest’s home screen during their stay: the thirteen places, the Awakening, and the choice game.",
      who: "Guests staying now. Reached from the QR card by the door.",
      data: [SRC.places], links: ["house/places/window.html", "house/awakening/index.html", "house/choose/index.html"],
      later: "Printed QR cards point here and to each place.",
      sections: [
        { sel: "section.band.deep", t: "You’re here", x: "The welcome on the mountain." },
        { sel: "section.band.soft:has(#list)", t: "The thirteen places", x: "Each opens the on-the-mountain version of the place." }
      ] },
    awakening: { layer: "house", title: "The Awakening", one: "house/awakening/index.html",
      purpose: "Seven acts walked across the property. The dome wakes as a mirror of the guest’s own life: light, sound, a question at each place, and at the end their first answer comes back to them.",
      who: "Guests staying now, on their own phone.",
      data: [SRC.device, "House lights and sound are cued through /house-cue (planned)."], links: ["house/awakening/act-1.html", "house/index.html"],
      later: "Next step: each act becomes a played scene at its place, with a story from guests who were there, a short film from the drone clips, and a game that fits.",
      sections: [] },
    act: { layer: "house", title: "An act of the Awakening", one: "house/awakening/act-1.html",
      purpose: "One act at one place. Hold to begin, the house answers with light and sound, a question is asked, and the answer stays on the phone.",
      who: "A guest at that place.", data: [SRC.device], links: ["house/awakening/index.html"], sections: [] },
    "house/choose/index.html": { layer: "house", title: "What would you have built?",
      purpose: "The story you choose: six choices Cody and Nicole faced building the dome. Choose, then see what they actually chose and what other guests chose.",
      who: "Guests on the mountain.", data: ["Anonymous tally, only if the guest agrees (/tally).", SRC.slots], links: ["how-it-began.html"],
      later: "The real answers wait for Cody and Nicole to confirm them.", sections: [] },

    "dashboard/index.html": { layer: "keeping", title: "The dashboard",
      purpose: "Eric and Mona’s side of everything: today, prices by day, bookings, guests’ words to approve, ideas to move along, and photos by season.",
      who: "Eric and Mona only. Live, it sits behind a one-time code sent to their email.",
      data: ["Reads and writes Airtable through the Worker (/dash/…). Here it runs on this device only."], links: ["stay.html", "ideas.html", "house/places/window.html"],
      sections: [
        { sel: "#tabs", t: "Six tabs", x: "Today · Prices and calendar · Bookings · Guests’ words · Ideas · Photos by season." },
        { sel: "#pane", t: "The working area", x: "Prices: set the base, seasons, weekends, or any single date (a date wins over everything). Words: approve or mark OLD; nothing is ever deleted." }
      ] }
  };

  // Every page links back to these names
  const NAMES = {};
  Object.entries(P).forEach(([k, v]) => (NAMES[v.one || k] = v.title));
  return { LAYERS, P, NAMES };
})();
