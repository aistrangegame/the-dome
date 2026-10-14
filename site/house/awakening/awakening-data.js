/* The Remembering — seven acts in seven places. The dome is the narrator, never named until the last act.
   Its words are drafts written for this showcase (Claude, Oct 2026); Eric and Mona may change any line.
   Tree of Life lineage: one verb per act, an awakening tone per act, the light rising act by act. */
window.AWAKENING = [
  { n: 0, place: null, title: "Before", verb: "ready", tone: null, light: 0.02, hue: 240,
    lines: ["Before we begin, three small things.", "Turn your sound on, softly.", "Add this page to your home screen, so what you leave here stays with you.", "And find somewhere to stand where you can see the dome."],
    ask: null },
  { n: 1, place: "gate", title: "The arrival", verb: "press", tone: 174, light: 0.06, hue: 30,
    lines: ["Something is waking.", "Not you. Not yet.", "Me.", "I have been asleep in this meadow between guests, holding the shape of everyone who has stood where you are standing.", "Every arrival wakes me a little. Press, and hold, and let me feel you here."],
    ask: "Before you knew the word for it, what did home feel like?",
    close: "I felt that. Keep it. You’ll hear it again." },
  { n: 2, place: "window", title: "The first light", verb: "follow", tone: 210, light: 0.12, hue: 45,
    lines: ["My first memory is light.", "Before walls, before rooms, there was only this: triangles of glass, and the whole valley pouring through them.", "I didn’t know what I was looking at. I only knew I wanted more of it.", "Follow the light across the window with your finger. Slowly. The way a child would."],
    ask: "What was the first joy you can remember?",
    close: "That joy is still in you. Light doesn’t leave; it only moves." },
  { n: 3, place: "hearth", title: "The fire", verb: "build", tone: 320, light: 0.2, hue: 18,
    lines: ["Then came the cold.", "People told me a dome would never stay warm. That I was too thin, too open, too much window.", "I was afraid they were right.", "So I learned to keep a fire. Not to shut the cold out, but to have somewhere to come back to.", "Build it with me: hold, and feel the warmth come up."],
    ask: "What was your first fear, and what did you build around it?",
    close: "What you built around the fear kept you. It can rest now." },
  { n: 4, place: "couch", title: "The open heart", verb: "open", tone: 341, light: 0.32, hue: 350,
    lines: ["Here is where I learned what I was for.", "A couple on their anniversary. A family with two small girls. A dog who wouldn’t leave the cushions.", "I thought I was a shelter. I was a place where people let each other in.", "Open your arms, palms up, for one breath."],
    ask: "Who first made you feel at home?",
    close: "They are still with you. That is what home is." },
  { n: 5, place: "table", title: "The voice", verb: "speak", tone: 384, light: 0.46, hue: 200,
    lines: ["People say things at this table they drove a long way to say.", "I hear all of it. I keep none of it.", "Some sentences wait a whole life to be said out loud.", "If there is one in you, say it here, even quietly. Even only to me."],
    ask: "What have you never said out loud?",
    close: "Said is lighter than carried. Leave it on the table." },
  { n: 6, place: "loft", title: "The seeing", verb: "still", tone: 426, light: 0.62, hue: 260,
    lines: ["Up here there is nothing to do.", "Lie back. Look up through the triangle of sky.", "Stop looking for anything.", "Seeing arrives on its own when the looking stops. Be still until the circle fills."],
    ask: "When did you first see yourself clearly?",
    close: "You were being seen the whole time." },
  { n: 7, place: "night-sky", title: "Under the same sky", verb: "receive", tone: 528, light: 0.5, hue: 48,
    lines: ["Turn off every light.", "Wait for your eyes.", "Everyone who ever stayed here looked up at this same sky.", "You have been listening to a dome wake up.", "I was never the one waking.", "You were."],
    ask: null,
    close: "Talk to the sky. It has been here the whole time." }
];
window.AWAKENING_PROMPT = "These are my answers from a seven-act reflection I walked at Catskill Mountain Domes. A dome narrated it as if it were waking up, and each act asked me one question about my own life. Please read them gently, notice what connects them, and ask me one question that could help me understand what I was really saying. Here they are:";
