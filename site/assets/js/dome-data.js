/* The Dome — the one content layer every page reads from.
   Guest words are verbatim from the 252 reviews (Airtable: Reviews), with first name and number.
   Anything marked as a SLOT is a stand-in for a real person's own words: it shows as a dashed
   card with the person's name until their words arrive. Never present a slot as their words. */

window.DOME = (function () {
  const SHOOT = {
    dog_window: "2-RISH0009", dog_window2: "3-RISH0013", living_dog: "4-RISH0022", dog_portrait: "5-RISH0028", dog_bw: "6-RISH0039",
    aerial_edge: "7-DJI_20260731172418_0208_D", aerial_pond: "8-DJI_20260731172422_0209_D", aerial_valley: "9-DJI_20260731172822_0214_D",
    aerial_valley_v: "10-DJI_20260731172901_0216_D", topdown: "11-DJI_20260731173421_0224_D", topdown_v: "12-DJI_20260731173450_0226_D",
    falls_bridge: "17-DJI_20260801145444_0254_D", falls_ledge: "18-DJI_20260801145548_0256_D", falls_ledge_v: "19-DJI_20260801145600_0257_D",
    falls_gorge: "20-DJI_20260801151850_0267_D", falls_gorge_v: "21-DJI_20260801151922_0268_D", falls_gorge2: "22-DJI_20260801151929_0269_D",
    dog_meadow: "30-RISH0081", backyard_v: "32-DJI_20260801164630_0286_D", dome_ridge: "36-RISH0122", dome_mountain: "37-RISH0126",
    dome_goldenrod: "38-RISH0130", dome_lace: "39-RISH0132", dome_lace_v: "40-RISH0134", dome_grass: "41-RISH0137", meadow_path: "42-RISH0139",
    backyard: "43-RISH0142", backyard_top_v: "44-DJI_20260802171926_0299_D", drive_top: "45-DJI_20260802172026_0301_D",
    valley_high: "46-DJI_20260802172315_0307_D", valley_high_v: "47-DJI_20260802172329_0308_D", hill_aerial: "48-DJI_20260802172623_0313_D",
    hill_close: "49-DJI_20260802172659_0314_D", dot_forest_v: "50-DJI_20260802173306_0327_D", disc: "51-DJI_20260802173407_0329_D"
  };
  const img = (k, w) => {
    if (k.startsWith("listing-")) return k + "-800.webp";
    return SHOOT[k] + "-" + (w || 1600) + ".webp";
  };

  const seasons = {
    summer: { name: "Summer", line: "Long light, wildflowers, the cedar pool under the stars.", count: 66 },
    fall:   { name: "Fall",   line: "The ridges turn rust and gold through the great window.", count: 76 },
    winter: { name: "Winter", line: "Snow on the meadow, the hearth lit, steam off the plunge pool.", count: 58 },
    spring: { name: "Spring", line: "The meadow wakes, the stream runs full, the trails open.", count: 52 }
  };

  // img: { summer, winter } — keys above. Fall and spring are imagined from summer until real photos exist.
  const places = [
    { slug: "gate", n: 1, name: "The gate and the drive", short: "Arriving", inout: "Threshold", act: 1,
      img: { summer: "drive_top", winter: null }, verb: "press",
      dome: "You came up the long way. Most people do. Stop here a moment, before the door. Everything you carried up the mountain can wait in the car.",
      todo: "Before you go in, turn around once and look back down the drive.",
      ask: "What did home feel like, before you knew the word?",
      voices: [[27, "Natasha", "Once we pulled up the scenery took my breath away!"], [34, "Rose", "The drive up was stunning, and spending two nights on top of the mountains was such a treat."], [96, "Michael", "From the moment you arrive, to the moment you leave, it makes you feel like you’re away from everything."]] },
    { slug: "window", n: 2, name: "The window", short: "Nature’s Tent", inout: "Inside", act: 2,
      img: { summer: "living_dog", winter: "listing-08" }, verb: "follow",
      dome: "I am mostly window. Triangles of glass, and the whole valley arranged inside them. Watch long enough and the hills move: light, then cloud, then light.",
      todo: "Give what you see three words. Only three.",
      ask: "What was the first joy you remember?",
      voices: [[28, "Tim", "We loved the large sofa right against the big window overlooking the mountains."], [42, "Laurie", "The big couch was the perfect spot to enjoy a morning coffee while taking in the view from inside the Dome."], [119, "Sherry", "After a deep and restful sleep, I woke early and was captivated by the starlit sky visible from the living room before sunrise."]] },
    { slug: "couch", n: 3, name: "The couch", short: "Settling", inout: "Inside", act: 4,
      img: { summer: "dog_window", winter: null }, verb: "open",
      dome: "This is where people stop pretending to be busy. Sit. The cushions remember everyone, the dogs most of all.",
      todo: "Put your phone face down for one song’s length.",
      ask: "Who first made you feel at home?",
      voices: [[76, "Alison", "it was lovely to sit on the comfortable couch with a cup of tea and look out of the dome walls at the countryside."], [239, "Rui", "the couch views are awesome and backyard area with hot tub is great too."], [198, "Rhiannon", "everything inside was so well thought out and it really felt like a second home."]] },
    { slug: "library", n: 4, name: "The library wall", short: "Books and games", inout: "Inside", act: 4,
      img: { summer: "listing-05", winter: null }, verb: "open",
      dome: "A moss wall and shelves of other people’s favourite books. When it rains, this is where the evening goes.",
      todo: "Open a book at random and read the first full sentence on the page.",
      ask: "What story did you love before you could read it yourself?",
      voices: [[82, "Vivian Elizabeth", "It rained part of our stay, but there are lots of books and games in the Dome, to play until the sky’s cleared."], [92, "Corinne", "It knocked out the power for the first evening/night so there were several scrabble games played by lantern."], [85, "Jo", "nicely furnished and with everything you need including a good selection of board games."]] },
    { slug: "table", n: 5, name: "The table", short: "Kitchen and table", inout: "Inside", act: 5,
      img: { summer: "listing-41", winter: null }, verb: "speak",
      dome: "Round table, wooden counter, a window to the meadow. People say the things here they drove all this way to say.",
      todo: "Cook one thing slowly, or make the coffee by hand.",
      ask: "What have you never said out loud?",
      voices: [[130, "Joel", "We originally had local dinner reservations but decided it would be better just to eat at the Dome and enjoy dusk in the Catskills with a wonderful view."], [16, "Laval", "the kitchen was spacious enough for the two of us to cook together"], [119, "Sherry", "On our final night, we took advantage of the kitchen amenaties, cooked a delicious dinner, and watched scary movies while listening to the rain."]] },
    { slug: "loft", n: 6, name: "The loft", short: "Loft and skylight", inout: "Inside", act: 6,
      img: { summer: "listing-17", winter: null }, verb: "still",
      dome: "Up the ladder, under the triangle of sky. Lie still. This is the only place in me where you look straight up.",
      todo: "Lie on your back and count ten slow breaths under the skylight.",
      ask: "When did you first see yourself clearly?",
      voices: [[188, "Jake", "We had a great time cozied up, loved sleeping in the loft and waking a giant skylight"], [58, "Jamie", "My kids (7 and 9) loved the pool/hot tub and loft."], [46, "James", "Highlights were the kitchen, the living space, the lofted bed space and the plunge pool"]] },
    { slug: "hearth", n: 7, name: "The hearth", short: "The fireplace", inout: "Inside", act: 3,
      img: { summer: "listing-02", winter: null }, verb: "build",
      dome: "People worry a dome will be cold. Then they find the fire. Warmth is the first thing I learned to keep.",
      todo: "Turn on the fire and sit close enough to feel it on your face.",
      ask: "What was your first fear, and what did you build around it?",
      voices: [[57, "Gabriela", "We were a bit worried it might be chilly inside because of the whole dome thing, but it was super warm and cozy – perfect for chilling by the fireplace."], [97, "Liam", "It got really cold outside while we were there, but the dome stayed nice and warm and cozy the whole time."], [41, "Sophie", "a lovely and easy to use fireplace inside (you don't need to bring wood for the inside one)."]] },
    { slug: "cedar-pool", n: 8, name: "The cedar plunge pool", short: "The pool", inout: "Outside", act: null,
      img: { summer: "backyard", winter: "listing-22" }, verb: "float",
      dome: "Warm water in a ring of cedar, the mountains on every side. People float here for hours and forget to count them.",
      todo: "Float on your back until you can’t tell where the water stops.",
      ask: "Where were you when you last felt weightless?",
      voices: [[35, "Francisco", "we floated for hours admiring the views during the day and the stars at night."], [41, "Sophie", "it was pretty magical to be in the hot water while the snow fell around us."], [188, "Jake", "the highlight for us was the wooden hot tub, where we felt transported."]] },
    { slug: "fire-circle", n: 9, name: "The fire circle", short: "Fire outside", inout: "Outside", act: null,
      img: { summer: null, winter: "listing-30" }, verb: "gather",
      dome: "Chairs in a ring, a fire in the middle, the ridge going dark. This is where the stories come out.",
      todo: "Tell someone here a story they haven’t heard.",
      ask: "Whose stories did you grow up listening to?",
      voices: [[119, "Sherry", "One of the most unforgettable moments was watching the harvest supermoon rise above the mountains while we sat around the firepit, sipping tea."], [52, "Travis", "our 5 and 9 year old had a great time running through the paths on the property and hanging out by the fire pit"], [126, "Toral", "Serene views and perfect cozy nights with fire pit outdoor and hot tub for our girls retreat."]] },
    { slug: "meadow", n: 10, name: "The meadow", short: "Wildflowers", inout: "Outside", act: null,
      img: { summer: "dome_goldenrod", winter: null }, verb: "wander",
      dome: "Goldenrod, Queen Anne’s lace, the mown paths looping through. I am small out here, and I like it.",
      todo: "Walk the mown path until you can’t see the dome, then turn back.",
      ask: "What grew wild where you grew up?",
      voices: [[16, "Laval", "The wild flowers and butterflies were divine!"], [42, "Laurie", "The natural surroundings cannot be beat - meadows of flowers, a walkable path for exploring, majestic mountains, and the perfect place for stargazing."], [106, "Anaïs", "The summer landscape, with its beautiful flowers and clear sky, was simply gorgeous."]] },
    { slug: "trails", n: 11, name: "Trails, pond and stream", short: "Down to the water", inout: "Outside", act: null,
      img: { summer: "aerial_pond", winter: "listing-28" }, verb: "walk",
      dome: "The paths run down to a small pond and on to the stream. The dogs always find it first.",
      todo: "Walk down to the water and listen for one full minute.",
      ask: "Where did you go when you needed to be alone as a child?",
      voices: [[66, "Tracy", "we loved the hot tub, walked down to the stream on the trails, and watched a movie while cozy in the dome."], [106, "Anaïs", "My pup loved the walking trails around the property, and we felt completely at ease having him with us."], [130, "Joel", "A beautiful interior coupled with walking trails for our dogs"]] },
    { slug: "night-sky", film: "night", n: 12, name: "The night sky", short: "Under the same sky", inout: "Outside", act: 7,
      img: { summer: "listing-34", winter: "listing-23" }, verb: "receive",
      dome: "Turn off every light. Wait for your eyes. Everyone who ever stayed here looked up at this same sky.",
      todo: "Turn off the lights, lie back and wait for one shooting star.",
      ask: "Your first answer comes back to you here.",
      voices: [[82, "Vivian Elizabeth", "Because the location is remote, we could see lots of stars, the Milky Way and even a few shooting stars."], [49, "Cheryl", "The plunge pool at night was magical, turn off the lights and marvel at the starry sky!"], [60, "Ca", "We enjoyed watching the stars…never saw so many in our lives; even saw the Milky Way!"]] },
    { slug: "guest-book", n: 13, name: "The guest book table", short: "What you leave", inout: "Inside", act: null,
      img: { summer: "listing-03", winter: null }, verb: "leave",
      dome: "Everything people leave here, I keep. A line, an idea, a name. The next guest finds it waiting.",
      todo: "Write one line for the person who sleeps here next.",
      ask: "What would you leave for someone you’ll never meet?",
      voices: [[35, "Francisco", "My two young daughters loved every second of staying here, they didn’t want to leave!"], [198, "Rhiannon", "our dog was SO upset when it was time to leave."], [8, "Meaghan", "I could only imagine how amazing it would be in the fall when the leaves are changing"]] }
  ];

  // Where real people's words belong. Each slot shows a stand-in until their words arrive.
  const slots = {
    em_welcome: { who: "Eric and Mona", title: "Their welcome",
      draft: "We came up this mountain as guests of someone else’s dream, and somewhere on the drive it became ours to keep. Welcome. Stay as long as you can.",
      prompts: ["What did you feel the first time you pulled up the drive?", "What do you hope every guest takes home?"] },
    em_why: { who: "Eric and Mona", title: "Why this place",
      draft: "Some places you choose. This one felt like it chose us: the window, the quiet, the 252 people who had already loved it before we arrived.",
      prompts: ["Why did you say yes to the dome?", "What did you see that you couldn’t walk away from?"] },
    em_first: { who: "Eric and Mona", title: "The first night that was ours",
      draft: "The first night we stayed as its keepers, we didn’t fix anything. We just sat by the window and let it be what it already was.",
      prompts: ["What was your first night here like?", "What did you notice that guests always mention?"] },
    em_changed: { who: "Eric and Mona", title: "What we’ve changed since April",
      draft: "Small things, mostly: robes by the door, games on the shelf, answers before you have to ask. We’re keeping what was loved and listening for what’s next.",
      prompts: ["What have you added or changed since April 2026?", "Were the robes and games your addition?"] },
    em_dream: { who: "Eric and Mona", title: "What we dream of next",
      draft: "That the dome becomes a place people return to, and find their own idea built into it when they do.",
      prompts: ["What do you dream of building here?", "What should a guest feel when they come back a second time?"] },
    em_place: { who: "Eric and Mona", title: "A line for this place",
      draft: "Your own line about this place goes here: what you love about it, or what you’d tell a friend standing in it.",
      prompts: ["What do you love about this place?", "What should guests not miss here?"] },
    cn_began: { who: "Cody and Nicole", title: "How it began",
      draft: "Before there was a dome, there was a hillside, a meadow, and a picture of a white sphere looking out at the ridge. We built it by hand, one triangle at a time.",
      prompts: ["Why a dome? Why this mountain?", "What did you build with your own hands?", "What was the hardest day, and the best?"] },
    cn_loved: { who: "Cody and Nicole", title: "The place each of us loved most",
      draft: "One of us would say the window at dawn. The other would say the cedar pool after dark. We never settled it.",
      prompts: ["Which place on the property did each of you love most?", "Where did you go when you had the dome to yourselves?"] },
    cn_line: { who: "Cody and Nicole", title: "A line for the guests who come after",
      draft: "We built it for people we’d never meet. If you’re reading this, it worked.",
      prompts: ["What would you say to the guests who come after you?"] },
    cn_choice: { who: "Cody and Nicole", title: "Why they chose this",
      draft: "Their reason for this choice goes here, in their own words.",
      prompts: ["Why did you make this choice?"] }
  };

  const stories = [
    { slug: "celebrate", title: "The ones who came to celebrate", lead: "Anniversaries, engagements, a proposal, a birthday surprise.",
      img: "listing-34", lines: [[49, "Cheryl", "My husband and I were celebrating our 30th anniversary."], [101, "Kaitlyn", "I chose this location for a proposal, and it did not disappoint."], [92, "Corinne", "My fiancé and I needed a place to get away for a few days to celebrate our engagement…this little dome in the middle of nowhere was perfect."], [12, "Ernesto", "they fulfilled a personal request to celebrate our 34th wedding anniversary."], [101, "Kaitlyn", "the magic it brings is better than Disney."]] ,
      close: "Some of them came back to say it again." },
    { slug: "dogs", title: "The ones who brought their dogs", lead: "67 stays came with a pet. The trails were theirs first.",
      img: "dog_meadow", lines: [[16, "Laval", "What a beautiful escape with my husband and our dog Nitro!"], [106, "Anaïs", "My pup loved the walking trails around the property, and we felt completely at ease having him with us."], [130, "Joel", "My wife, two dogs and I really enjoyed our stay."], [198, "Rhiannon", "our dog was SO upset when it was time to leave."]],
      close: "The couch remembers them most." },
    { slug: "snow", title: "The ones who came in the snow", lead: "Winter on the mountain: the hearth, the steam, the four-wheel drive.",
      img: "listing-23", lines: [[57, "Gabriela", "The dome looked amazing in the photos, but seeing it in real life, especially with the snow falling, was something else."], [57, "Gabriela", "It's like our own little winter fairytale igloo."], [41, "Sophie", "it was pretty magical to be in the hot water while the snow fell around us."], [100, "Jasmine", "The property and surrounding area is so beautiful and peaceful, especially when covered in snow."]],
      close: "The fire was always lit when they came back in." },
    { slug: "children", title: "The ones who brought their children", lead: "Paths to run, a loft to climb, a pool to float in.",
      img: "meadow_path", lines: [[35, "Francisco", "My two young daughters loved every second of staying here, they didn’t want to leave!"], [52, "Travis", "our 5 and 9 year old had a great time running through the paths on the property and hanging out by the fire pit"], [58, "Jamie", "My kids (7 and 9) loved the pool/hot tub and loft."], [20, "Sarah", "I had an absolutely enchanting stay at the unique dome in the Catskills with my fiancé Matthew and our daughter Zoey."]],
      close: "They will remember it as the round house." },
    { slug: "stop", title: "The ones who came to stop", lead: "No signal, no traffic, nothing to do but be here.",
      img: "dome_ridge", lines: [[96, "Michael", "From the moment you arrive, to the moment you leave, it makes you feel like you’re away from everything."], [96, "Michael", "That’s the exact reason why we came and it did the job perfectly."], [191, "Rebecca", "it was away from noise and light pollution; it was everything we could have hoped for."], [8, "Meaghan", "Peaceful, relaxing and just us."]],
      close: "It did what it was built for." },
    { slug: "sky", title: "The ones who looked up", lead: "The night sky, the Milky Way, a harvest moon over the ridge.",
      img: "listing-23", lines: [[82, "Vivian Elizabeth", "we could see lots of stars, the Milky Way and even a few shooting stars."], [119, "Sherry", "One of the most unforgettable moments was watching the harvest supermoon rise above the mountains while we sat around the firepit, sipping tea."], [60, "Ca", "We enjoyed watching the stars…never saw so many in our lives; even saw the Milky Way!"], [12, "Ernesto", "The stars. OmG."]],
      close: "Under the same sky." }
  ];

  const timeline = [
    { when: "Before 2023", kind: "slot", slot: "cn_began", title: "A hillside, a meadow, an idea" },
    { when: "August 2023", kind: "guest", title: "The first guests", review: [20, "Sarah", "I had an absolutely enchanting stay at the unique dome in the Catskills with my fiancé Matthew and our daughter Zoey."] },
    { when: "September 2023", kind: "guest", title: "The scenery took her breath away", review: [27, "Natasha", "Once we pulled up the scenery took my breath away!"] },
    { when: "October 2023", kind: "guest", title: "A 30th anniversary", review: [49, "Cheryl", "The plunge pool at night was magical, turn off the lights and marvel at the starry sky!"] },
    { when: "January 2024", kind: "guest", title: "The first winter, and a blizzard", review: [57, "Gabriela", "Also big shoutout for getting someone to clear the snow from the driveway in the morning after the blizzard."] },
    { when: "July 2024", kind: "idea", title: "A guest asks for a safer ladder", review: [59, "Deborah", "the ladder rungs are widely spaced and slippery"] },
    { when: "December 2024", kind: "guest", title: "A proposal", review: [101, "Kaitlyn", "I chose this location for a proposal, and it did not disappoint."] },
    { when: "March 2025", kind: "guest", title: "Scrabble by lantern", review: [92, "Corinne", "there were several scrabble games played by lantern."] },
    { when: "September 2025", kind: "idea", title: "A guest asks for a light at the parking area", review: [133, "Mike", "My only suggestion would be to have lights that are always on by the entrance parking area."] },
    { when: "October 2025", kind: "guest", title: "The harvest supermoon", review: [119, "Sherry", "watching the harvest supermoon rise above the mountains while we sat around the firepit, sipping tea."] },
    { when: "April 2026", kind: "mark", title: "Cody and Nicole hand the dome to Eric and Mona", slot: "cn_line" },
    { when: "Spring 2026", kind: "slot", slot: "em_first", title: "The first night that was theirs" },
    { when: "July 2026", kind: "guest", title: "Nitro the dog, on an 85 degree day", review: [16, "Laval", "We absolutely loved the cedar pool! The temperature was perfect, even on an 85 degree day."] },
    { when: "July 31 – August 2, 2026", kind: "mark", title: "The summer shoot: the dome seen from the sky" },
    { when: "August 2026", kind: "guest", title: "A 34th anniversary", review: [12, "Ernesto", "Eric and his team were amazing as they went above and beyond"] },
    { when: "September 2026", kind: "guest", title: "Robes and games, noticed", review: [3, "Jacqueline", "The extras that were provided such as robes and games were really a nice touch!"] },
    { when: "October 2026", kind: "guest", title: "Fall, and the newest voice", review: [1, "Anastasya", "The fall foliage was incredible, there is something really special about the location."] },
    { when: "Next", kind: "slot", slot: "em_dream", title: "What comes next" }
  ];

  const ideas = [
    { idea: "A light that stays on at the parking area", who: "Mike and Kyle", place: "gate", status: "Heard", words: [133, "Mike", "My only suggestion would be to have lights that are always on by the entrance parking area. It’s pitch black at night time unless you trigger the sensor."] },
    { idea: "Door and wifi codes sent before you arrive", who: "Kristin and Brianna", place: "gate", status: "Planned", words: [67, "Brianna", "Screenshot all door access/wifi codes well ahead of your arrival and read thoroughly."], note: "Now part of booking: codes arrive 24 to 48 hours before you do." },
    { idea: "An extra set of towels for the pool and shower", who: "Karenine", place: "cedar-pool", status: "Heard", words: [69, "Karenine", "we could have benefited from having one extra set of towels for pool and shower."] },
    { idea: "Outdoor furniture refreshed", who: "Karenine", place: "fire-circle", status: "Heard", words: [69, "Karenine", "The outside furniture looks very run down."] },
    { idea: "A bigger grill", who: "Kyle", place: "fire-circle", status: "Heard", words: [108, "Kyle", "I would’ve liked a bigger grill but we still managed."] },
    { idea: "A safer loft ladder", who: "Deborah", place: "loft", status: "Heard", words: [59, "Deborah", "the ladder rungs are widely spaced and slippery, the transition to the top is difficult"] },
    { idea: "Robes and games", who: "Jacqueline noticed them", place: "couch", status: "Built?", words: [3, "Jacqueline", "The extras that were provided such as robes and games were really a nice touch!"], note: "If Eric and Mona added these, this becomes their first change on the timeline." }
  ];

  const around = [
    { group: "Close by", items: [["Broken Spoke Stables", "3 min", "The neighbours. Horseback riding."], ["Stamford", "10 min", "Coffee, cinnamon buns, the golf club."], ["Hobart, the book village", "10 min", "Six bookstores in one small town."]] },
    { group: "Eat and drink", items: [["Stamford Coffee", "", "Guests mention the cinnamon buns."], ["Mill Pond Inn", "", "Pizza nights."], ["Belvedere Country Inn", "", "The speakeasy guests whisper about."], ["Bovina Farm & Fermentory", "", ""], ["Brushland Eating House", "", ""], ["The Print House", "", "A vinyl bar."]] },
    { group: "Snow and slopes", items: [["Plattekill", "15 min", "Skiing and snow tubing."], ["Belleayre", "30 min", "Skiing."], ["Windham", "40 min", "Skiing and the spa."]] },
    { group: "Water and trails", items: [["Mine Kill Falls", "20 min", "Waterfall overlook."], ["Shavertown Trail", "", "Along the Pepacton reservoir."], ["Susan’s Pleasant Pheasant Farm", "", "Kayaks."]] },
    { group: "Further", items: [["Delaware & Ulster Rail Ride", "", ""], ["Baseball Hall of Fame", "1 hr", "Cooperstown."]] }
  ];

  const sample = { base: 325, weekend: 60, cleaning: 95, minNights: 2, salesTax: 0.08, occupancy: 0.02,
    seasonUplift: { summer: 40, fall: 60, winter: 20, spring: 0 } };

  // false until the Worker answers /words, /tally and /house-cue; until then nothing leaves the device
  const live = false;

  return { SHOOT, img, seasons, places, slots, stories, timeline, ideas, around, sample, live };
})();
