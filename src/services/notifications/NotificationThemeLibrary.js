/**
 * Calyxo Notification Theme Library
 *
 * Comprehensive structured theme catalog for the Daily Notification Intelligence Engine.
 * Every entry has:
 *  - id: unique theme identifier
 *  - family: semantic theme family (for cooldown deduplication)
 *  - tone: writing style/energy (playful, urgent, warm, chaotic, competitive, reflective, absurd, desi, dramatic)
 *  - hookType: opening hook (personification, breaking_news, question, challenge, plot_twist, stats, role_play, identity)
 *  - ctaType: action type (open_dashboard, log_water, log_meal, log_workout, view_streak, view_progress)
 *  - days: optional array of day-of-week restrictions (0=Sun, 1=Mon, ..., 6=Sat) — null/omitted for any day
 *  - priority: 'P0' (Streak protect), 'P1' (Critical health/water/briefing), 'P2' (Engagement/workout/steps), 'P3' (Fun/personality)
 *  - categories: array of NOTIFICATION_CATEGORIES ('HYDRATION', 'WORKOUT', 'NUTRITION', 'STREAK', 'BRIEFING', 'MARKETING', 'ENGAGEMENT')
 *  - variants: array of { title, body }
 */

export const THEME_FAMILIES = {
  COUCH_LAZINESS:      'couch_laziness',
  GYM_SHOES:           'gym_shoes',
  WATER_BOTTLE:        'water_bottle',
  WATER_ZERO:          'water_zero',
  FRIDGE_TALK:         'fridge_talk',
  CALORIE_TALK:        'calorie_talk',
  MUSCLE_TALK:         'muscle_talk',
  TRACKER_TALK:        'tracker_talk',
  FUTURE_SELF:         'future_self',
  BODY_COMPLAINT:      'body_complaint',
  INDIAN_FOOD:         'indian_food',
  BREAKING_NEWS:       'breaking_news',
  MISSION_BRIEF:       'mission_brief',
  COURTROOM_DRAMA:     'courtroom_drama',
  REALITY_SHOW:        'reality_show',
  SPORTS_COMMENTARY:   'sports_commentary',
  IPL_COMMENTARY:      'ipl_commentary',
  BOLLYWOOD_DRAMA:     'bollywood_drama',
  DETECTIVE_CASE:      'detective_case',
  STREAK_PROTECT:      'streak_protect',
  STREAK_CELEBRATE:    'streak_celebrate',
  MONDAY_BLUES:        'monday_blues',
  TUESDAY_ROLLING:     'tuesday_rolling',
  WEDNESDAY_CHECKPOINT:'wednesday_checkpoint',
  THURSDAY_ALMOST:     'thursday_almost',
  FRIDAY_ENERGY:       'friday_energy',
  WEEKEND_MODE:        'weekend_mode',
  SUNDAY_RESET:        'sunday_reset',
  OFFICE_HUMOR:        'office_humor',
  COLLEGE_HUMOR:       'college_humor',
  DESI_FRIEND:         'desi_friend',
  GYM_BRO:             'gym_bro',
  SLEEP_EXCUSE:        'sleep_excuse',
  INNER_VOICE:         'inner_voice',
  SIDE_QUEST:          'side_quest',
  PLOT_TWIST:          'plot_twist',
  COMEBACK_STORY:      'comeback_story',
  QUIET_MOTIVATE:      'quiet_motivate',
  PROCRASTINATION:     'procrastination',
  IDENTITY_BASED:      'identity_based',
  SMALL_WIN:           'small_win',
  STEPS_HUMOR:         'steps_humor',
  PROTEIN_HUMOR:       'protein_humor',
  DAY_BRIEFING_WIN:    'day_briefing_win',
  DAY_BRIEFING_MISS:   'day_briefing_miss',
  CHEESY_ROMANCE:      'cheesy_romance',
  BOLLYWOOD_CHEESY:    'bollywood_cheesy',
  MAIN_CHARACTER:      'main_character',
  GYM_CRUSH:           'gym_crush',
  DUOLINGO_GUILT:      'duolingo_guilt',
  POP_CULTURE_MEMES:   'pop_culture_memes',
  TONES_FLIRTY:        'tones_flirty',

};

export const TONES = {
  PLAYFUL:     'playful',
  URGENT:      'urgent',
  WARM:        'warm',
  CHAOTIC:     'chaotic',
  COMPETITIVE: 'competitive',
  REFLECTIVE:  'reflective',
  ABSURD:      'absurd',
  DESI:        'desi',
  DRAMATIC:    'dramatic',
};

export const HOOK_TYPES = {
  PERSONIFICATION: 'personification',
  BREAKING_NEWS:   'breaking_news',
  QUESTION:        'question',
  CHALLENGE:       'challenge',
  PLOT_TWIST:      'plot_twist',
  STATS:           'stats',
  ROLE_PLAY:       'role_play',
  IDENTITY:        'identity',
};

export const CTA_TYPES = {
  OPEN_DASHBOARD: 'open_dashboard',
  LOG_WATER:      'log_water',
  LOG_MEAL:       'log_meal',
  LOG_WORKOUT:    'log_workout',
  VIEW_STREAK:    'view_streak',
  VIEW_PROGRESS:  'view_progress',
};

export const NOTIFICATION_THEMES = [

  // ══════════════════════════════════════════════════════════════════════════
  // 1. MIDDAY & HYDRATION THEMES (12:00 PM Midday Water & Hydration Alert)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'water_unemployed_bottle',
    family: THEME_FAMILIES.WATER_BOTTLE,
    tone: TONES.ABSURD,
    hookType: HOOK_TYPES.PERSONIFICATION,
    ctaType: CTA_TYPES.LOG_WATER,
    priority: 'P1',
    categories: ['HYDRATION'],
    variants: [
      {
        title: '0ml? Your water bottle is currently unemployed 💧',
        body: 'It arrived at your desk at 9 AM, sat there in silence, and did zero work. Give it purpose. Drink up.'
      },
      {
        title: 'Your water bottle filed for unemployment 💧👀',
        body: 'Reported duties: 0ml consumed. It wants to contribute to your gains. Take 3 huge gulps right now.'
      }
    ]
  },
  {
    id: 'water_brain_buffering',
    family: THEME_FAMILIES.WATER_ZERO,
    tone: TONES.PLAYFUL,
    hookType: HOOK_TYPES.STATS,
    ctaType: CTA_TYPES.LOG_WATER,
    priority: 'P1',
    categories: ['HYDRATION'],
    variants: [
      {
        title: 'Your brain is buffering at 480p 🧠💧',
        body: 'Zero water past 12:00 PM means 2% cognitive clarity. One tall glass upgrades your brain to 4K ultra HD.'
      },
      {
        title: 'H2-OH NO! 🌊',
        body: 'Your hydration level is at desert status. Drink 300ml right now to unlock instant afternoon focus.'
      }
    ]
  },
  {
    id: 'water_desi_dost',
    family: THEME_FAMILIES.DESI_FRIEND,
    tone: TONES.DESI,
    hookType: HOOK_TYPES.QUESTION,
    ctaType: CTA_TYPES.LOG_WATER,
    priority: 'P1',
    categories: ['HYDRATION'],
    variants: [
      {
        title: 'Bhai paani piya kya? 💧👀',
        body: '12 baj gaye aur app mein 0ml hai. Ek glass paani piyo aur log karo — glow bhi aayega aur energy bhi.'
      },
      {
        title: 'Chai baad mein, pehle paani 🫗',
        body: 'Afternoon slump se bachna hai? 1 glass water log karo, hydration streak protect karo.'
      }
    ]
  },
  {
    id: 'water_breaking_news',
    family: THEME_FAMILIES.BREAKING_NEWS,
    tone: TONES.DRAMATIC,
    hookType: HOOK_TYPES.BREAKING_NEWS,
    ctaType: CTA_TYPES.LOG_WATER,
    priority: 'P1',
    categories: ['HYDRATION'],
    variants: [
      {
        title: '🚨 BREAKING: Local human forgets water exists',
        body: 'Scientists baffled as resident reaches noon with 0ml logged. Experts prescribe 1 immediate tall glass.'
      },
      {
        title: '🔴 URGENT DISPATCH: Drought detected',
        body: 'Calyxo weather radar detects extreme dryness in your bio-system. Send in the hydration rescue squad!'
      }
    ]
  },
  {
    id: 'water_plant_analogy',
    family: THEME_FAMILIES.BODY_COMPLAINT,
    tone: TONES.WARM,
    hookType: HOOK_TYPES.PERSONIFICATION,
    ctaType: CTA_TYPES.LOG_WATER,
    priority: 'P1',
    categories: ['HYDRATION'],
    variants: [
      {
        title: 'You are essentially a houseplant with complicated emotions 🪴',
        body: 'Water yourself! It is 12 PM and your leaves are drooping. One glass, 10 seconds, instant reset.'
      },
      {
        title: 'Remember to water your human 🌱',
        body: 'Midday hydration check. A quick 300ml now keeps your metabolism firing all through the afternoon.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 2. 4:30 PM WORKOUT & VIRAL ENGAGEMENT THEMES
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'couch_restraining_order',
    family: THEME_FAMILIES.COUCH_LAZINESS,
    tone: TONES.ABSURD,
    hookType: HOOK_TYPES.PERSONIFICATION,
    ctaType: CTA_TYPES.LOG_WORKOUT,
    priority: 'P2',
    categories: ['WORKOUT', 'MARKETING', 'ENGAGEMENT'],
    variants: [
      {
        title: 'Your couch filed a restraining order 🛋️🏃‍♂️',
        body: 'It says: "Please leave me alone for 45 minutes and go hit the gym." Don\'t disappoint your furniture!'
      },
      {
        title: 'Sofa union holding emergency meeting 🛋️⚖️',
        body: 'They demand mandatory separation between 5 PM and 6 PM for gym activity. The court orders compliance.'
      }
    ]
  },
  {
    id: 'gym_shoes_wellness_check',
    family: THEME_FAMILIES.GYM_SHOES,
    tone: TONES.PLAYFUL,
    hookType: HOOK_TYPES.PERSONIFICATION,
    ctaType: CTA_TYPES.LOG_WORKOUT,
    priority: 'P2',
    categories: ['WORKOUT', 'MARKETING', 'ENGAGEMENT'],
    variants: [
      {
        title: 'Your gym shoes requested a wellness check 👟👀',
        body: 'They\'ve been sitting by the door looking dramatic all day. Tie those laces and go crush today\'s set!'
      },
      {
        title: 'Your sneakers are judging your life choices 👟😒',
        body: 'They were made for personal records, not shoe racks. Take them out for a 30-minute high-intensity run.'
      }
    ]
  },
  {
    id: 'desi_biryani_gains',
    family: THEME_FAMILIES.INDIAN_FOOD,
    tone: TONES.DESI,
    hookType: HOOK_TYPES.PERSONIFICATION,
    ctaType: CTA_TYPES.LOG_WORKOUT,
    priority: 'P2',
    categories: ['WORKOUT', 'MARKETING', 'ENGAGEMENT'],
    variants: [
      {
        title: 'Biryani is temporary, gains are forever 🍗🏆',
        body: 'Balance is everything. Go smash today\'s workout, log your session, and celebrate your progress!'
      },
      {
        title: 'Bhai gym chale jao! 💪🍗',
        body: 'Told our copywriter to write a push notification, he wrote: "Gym chale jao, biryani digest karni hai." He\'s not wrong.'
      },
      {
        title: 'Paneer or Chicken? 🥗🔥',
        body: 'Doesn\'t matter as long as you hit that protein goal! You\'re only one workout away from a top-tier mood.'
      }
    ]
  },
  {
    id: 'cricket_commentary_match',
    family: THEME_FAMILIES.CRICKET_COMMENTARY,
    tone: TONES.DRAMATIC,
    hookType: HOOK_TYPES.ROLE_PLAY,
    ctaType: CTA_TYPES.LOG_WORKOUT,
    priority: 'P2',
    categories: ['WORKOUT', 'ENGAGEMENT'],
    variants: [
      {
        title: '🏏 And the batsman walks out to the crease!',
        body: 'The field is set, the afternoon sun is warm, and your workout is waiting. Don\'t leave the pitch scoreless — hit a six!'
      },
      {
        title: 'Strategic Timeout over! 📢',
        body: 'Commentators report the user has 45 minutes to bag today\'s fitness trophy. Strap the gloves on and lift!'
      }
    ]
  },
  {
    id: 'future_sixpack_calling',
    family: THEME_FAMILIES.FUTURE_SELF,
    tone: TONES.WARM,
    hookType: HOOK_TYPES.IDENTITY,
    ctaType: CTA_TYPES.LOG_WORKOUT,
    priority: 'P2',
    categories: ['WORKOUT', 'ENGAGEMENT'],
    variants: [
      {
        title: 'Your future six-pack called 📱✨',
        body: 'It asked: "Why are you still scrolling? Open Calyxo and let\'s finish today\'s challenge!"'
      },
      {
        title: 'Message from You in December 2026 📬',
        body: '"Thank you for not skipping today\'s workout. That single session kept the momentum going."'
      }
    ]
  },
  {
    id: 'procrastination_tragedy',
    family: THEME_FAMILIES.PROCRASTINATION,
    tone: TONES.ABSURD,
    hookType: HOOK_TYPES.QUESTION,
    ctaType: CTA_TYPES.LOG_WORKOUT,
    priority: 'P2',
    categories: ['WORKOUT', 'ENGAGEMENT'],
    variants: [
      {
        title: '"I\'ll do it at 5:00" — A Shakespearean Tragedy 🎭',
        body: 'It is now 4:30 PM. The prophecy approaches. Break the cycle, grab your gym bag, and start.'
      },
      {
        title: 'Legend says... 👻🔥',
        body: 'If you log your workout now, calories burn in panic! Don\'t give them peace, crush today\'s session.'
      }
    ]
  },
  {
    id: 'steps_cinematic_walk',
    family: THEME_FAMILIES.STEPS_HUMOR,
    tone: TONES.ABSURD,
    hookType: HOOK_TYPES.ROLE_PLAY,
    ctaType: CTA_TYPES.OPEN_DASHBOARD,
    priority: 'P2',
    categories: ['ENGAGEMENT'],
    variants: [
      {
        title: '2,100 steps left. Cue the cinematic soundtrack 🎬',
        body: 'That\'s basically one dramatic stroll while pretending you\'re in a movie. Put your headphones on and walk.'
      },
      {
        title: 'Relationship Status: Committed to 10k Steps 👟💨',
        body: 'No ghosting your health goals today. Step outside, close those rings, and level up your XP!'
      }
    ]
  },
  {
    id: 'side_quest_adventure',
    family: THEME_FAMILIES.SIDE_QUEST,
    tone: TONES.PLAYFUL,
    hookType: HOOK_TYPES.ROLE_PLAY,
    ctaType: CTA_TYPES.LOG_WORKOUT,
    priority: 'P3',
    categories: ['WORKOUT', 'ENGAGEMENT'],
    variants: [
      {
        title: '📜 NEW SIDE QUEST: 30-Minute Bodyweight Blitz',
        body: 'Difficulty: Moderate. Rewards: +250 XP, dopamine rush, and the right to eat dinner guilt-free. Accept quest?'
      },
      {
        title: 'Boss Battle: Evening Inertia 🛡️⚔️',
        body: 'Weakness: 10 jumping jacks and a set of pushups. Deploy special move: Open Calyxo Workout Logger.'
      }
    ]
  },
  {
    id: 'bollywood_interval_drama',
    family: THEME_FAMILIES.BOLLYWOOD_DRAMA,
    tone: TONES.DRAMATIC,
    hookType: HOOK_TYPES.ROLE_PLAY,
    ctaType: CTA_TYPES.LOG_WORKOUT,
    priority: 'P3',
    categories: ['ENGAGEMENT', 'WORKOUT'],
    variants: [
      {
        title: '🎬 Picture abhi baaki hai, mere dost! 💪',
        body: 'Interval is over. Time for the hero entry at the gym. Log your sets and rewrite the climax!'
      },
      {
        title: 'Hum ek baar jeete hain, workout roz karte hain 💥',
        body: 'No excuses, only reps. Step on the floor and make today\'s episode blockbuster-worthy.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 3. 1:00 PM NUTRITION & MACRO THEMES
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'nutrition_empty_plate',
    family: THEME_FAMILIES.CALORIE_TALK,
    tone: TONES.PLAYFUL,
    hookType: HOOK_TYPES.QUESTION,
    ctaType: CTA_TYPES.LOG_MEAL,
    priority: 'P1',
    categories: ['NUTRITION'],
    variants: [
      {
        title: 'Did lunch happen, or is it a secret? 🍽️👀',
        body: 'Calyxo logs show 0 calories so far today. If you ate, claim your meal macros! 30 seconds to log.'
      },
      {
        title: 'Your calories have trust issues 🔢',
        body: 'You ate delicious food, but didn\'t tell Calyxo. Log your lunch to keep your nutrition streak alive.'
      }
    ]
  },
  {
    id: 'nutrition_desi_khana',
    family: THEME_FAMILIES.INDIAN_FOOD,
    tone: TONES.DESI,
    hookType: HOOK_TYPES.PERSONIFICATION,
    ctaType: CTA_TYPES.LOG_MEAL,
    priority: 'P1',
    categories: ['NUTRITION'],
    variants: [
      {
        title: 'Dal, Roti, ya Rice? Log karo bhai 🫘🍲',
        body: 'Ghar ka khana ho ya Swiggy order — calorie counter is ready. Log in 1 tap to hit today\'s target.'
      },
      {
        title: 'Protein check: Paneer, Eggs, ya Soya? 🍳',
        body: 'Hit that midday protein target so your muscles don\'t file a complaint. Quick log in Calyxo.'
      }
    ]
  },
  {
    id: 'nutrition_streak_at_risk',
    family: THEME_FAMILIES.STREAK_PROTECT,
    tone: TONES.URGENT,
    hookType: HOOK_TYPES.STATS,
    ctaType: CTA_TYPES.LOG_MEAL,
    priority: 'P1',
    categories: ['NUTRITION', 'STREAK'],
    variants: [
      {
        title: '🥗 Nutrition log still pending!',
        body: 'Don\'t let today\'s nutrition scorecard sit at zero. Quick 20-second food log keeps your streak clean.'
      },
      {
        title: '⚡ 1:00 PM Fuel Check',
        body: 'Log your lunch to see how many calories and protein grams you have left for dinner!'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 4. 10:30 PM AI NIGHTLY BRIEFING & STREAK RESCUE THEMES
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'briefing_elite_day_celebration',
    family: THEME_FAMILIES.DAY_BRIEFING_WIN,
    tone: TONES.WARM,
    hookType: HOOK_TYPES.IDENTITY,
    ctaType: CTA_TYPES.OPEN_DASHBOARD,
    priority: 'P1',
    categories: ['BRIEFING'],
    variants: [
      {
        title: '🌙 Today was actually kind of elite 🔥',
        body: 'Nutrition locked in, movement tracked, hydration secured. Tap to see your full daily scorecard & tomorrow\'s AI workout.'
      },
      {
        title: '🌙 Day Review: Outstanding Execution 🏆',
        body: 'You crushed today\'s biometrics targets. Sleep like a champion tonight — tomorrow we level up again.'
      }
    ]
  },
  {
    id: 'briefing_missing_workout_rescue',
    family: THEME_FAMILIES.DAY_BRIEFING_MISS,
    tone: TONES.URGENT,
    hookType: HOOK_TYPES.STATS,
    ctaType: CTA_TYPES.LOG_WORKOUT,
    priority: 'P0',
    categories: ['BRIEFING', 'STREAK'],
    variants: [
      {
        title: '🌙 Tiny problem, big consequences 👀',
        body: 'Your workout is still sitting unlogged on the checklist. 30 seconds to log it and protect today\'s streak!'
      },
      {
        title: '⚡ Midnight Streak Emergency 🚨',
        body: 'Clock is ticking down to 12:00 AM! Log your session right now to save your active streak from resetting.'
      }
    ]
  },
  {
    id: 'briefing_missing_water_rescue',
    family: THEME_FAMILIES.WATER_ZERO,
    tone: TONES.PLAYFUL,
    hookType: HOOK_TYPES.STATS,
    ctaType: CTA_TYPES.LOG_WATER,
    priority: 'P1',
    categories: ['BRIEFING', 'HYDRATION'],
    variants: [
      {
        title: '🌙 Almost perfect day — except water 💧',
        body: 'Everything else was crushed, but hydration is under target. Drink one tall glass before bed and log it!'
      },
      {
        title: '🌙 10:30 PM Hydration Wrap-Up 🫗',
        body: 'Final glass of the night unlocks maximum overnight recovery. Log your intake and rest easy.'
      }
    ]
  },
  {
    id: 'briefing_nothing_logged_rescue',
    family: THEME_FAMILIES.STREAK_PROTECT,
    tone: TONES.URGENT,
    hookType: HOOK_TYPES.STATS,
    ctaType: CTA_TYPES.OPEN_DASHBOARD,
    priority: 'P0',
    categories: ['BRIEFING', 'STREAK'],
    variants: [
      {
        title: '🚨 Streak Resets in 90 Minutes!',
        body: 'Don\'t let your hard-earned streak reset at midnight. Open Calyxo for a 30-sec check-in and save it!'
      },
      {
        title: '🌙 Last Call for Today\'s Streak 🔥',
        body: 'A single tap keeps the fire alive. Check in now before the midnight rollover resets your counter.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 5. DAY-OF-WEEK SPECIFIC PERSONALITY THEMES
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'monday_back_to_reality',
    family: THEME_FAMILIES.MONDAY_BLUES,
    tone: TONES.COMPETITIVE,
    hookType: HOOK_TYPES.CHALLENGE,
    ctaType: CTA_TYPES.OPEN_DASHBOARD,
    days: [1], // Monday
    priority: 'P3',
    categories: ['ENGAGEMENT', 'WORKOUT'],
    variants: [
      {
        title: 'Monday hit different 💪',
        body: 'Your competition is still waking up. Monday is where the week\'s momentum is won. Open Calyxo and set the tone.'
      },
      {
        title: 'New week. Fresh scoreboard ⚡',
        body: 'Weekend slate wiped clean. 7 days of opportunities starting today. First objective: hit the gym floor.'
      }
    ]
  },
  {
    id: 'tuesday_already_rolling',
    family: THEME_FAMILIES.TUESDAY_ROLLING,
    tone: TONES.PLAYFUL,
    hookType: HOOK_TYPES.STATS,
    ctaType: CTA_TYPES.OPEN_DASHBOARD,
    days: [2], // Tuesday
    priority: 'P3',
    categories: ['ENGAGEMENT'],
    variants: [
      {
        title: 'Tuesday Momentum: Engaged ⚙️🔥',
        body: 'Monday\'s soreness is Tuesday\'s strength. Keep the rhythm going — check today\'s targets in Calyxo.'
      },
      {
        title: 'Day 2 of 7 in progress 🚀',
        body: 'Consistency is showing up on the unglamorous days. Tuesday is where real athletes pull ahead.'
      }
    ]
  },
  {
    id: 'wednesday_midweek_checkpoint',
    family: THEME_FAMILIES.WEDNESDAY_CHECKPOINT,
    tone: TONES.COMPETITIVE,
    hookType: HOOK_TYPES.STATS,
    ctaType: CTA_TYPES.VIEW_PROGRESS,
    days: [3], // Wednesday
    priority: 'P3',
    categories: ['ENGAGEMENT'],
    variants: [
      {
        title: 'Wednesday Checkpoint: 50% through 📊',
        body: 'Midweek scoreboard is live. Are your calorie deficit and workout goals on pace? Tap to inspect.'
      },
      {
        title: 'Hump Day Challenge 🐫💥',
        body: 'Don\'t let your week slide backward on Wednesday. Log one workout and lock in the second half.'
      }
    ]
  },
  {
    id: 'thursday_almost_there',
    family: THEME_FAMILIES.THURSDAY_ALMOST,
    tone: TONES.PLAYFUL,
    hookType: HOOK_TYPES.CHALLENGE,
    ctaType: CTA_TYPES.OPEN_DASHBOARD,
    days: [4], // Thursday
    priority: 'P3',
    categories: ['ENGAGEMENT'],
    variants: [
      {
        title: 'Thursday: Weekend loading at 80% 🔋',
        body: 'Almost there! Finish this week\'s training split strong so you can enjoy Friday guilt-free.'
      },
      {
        title: 'One good session away from Friday 🏋️‍♂️✨',
        body: 'Don\'t coast now. A solid 45-minute push today makes the weekend taste 10x better.'
      }
    ]
  },
  {
    id: 'friday_weekend_loading',
    family: THEME_FAMILIES.FRIDAY_ENERGY,
    tone: TONES.CHAOTIC,
    hookType: HOOK_TYPES.CHALLENGE,
    ctaType: CTA_TYPES.OPEN_DASHBOARD,
    days: [5], // Friday
    priority: 'P3',
    categories: ['ENGAGEMENT'],
    variants: [
      {
        title: 'FRIDAY ENERGY UNLOCKED ⚡🎉',
        body: 'Weekend in 4 hours! One final workout and a clean nutrition log before celebration mode begins.'
      },
      {
        title: 'Friday Protocol: Earn the weekend 🏆',
        body: 'Heavy reps today = worry-free Saturday brunch tomorrow. Get in, lift hard, get out!'
      }
    ]
  },
  {
    id: 'saturday_weekend_mode',
    family: THEME_FAMILIES.WEEKEND_MODE,
    tone: TONES.WARM,
    hookType: HOOK_TYPES.CHALLENGE,
    ctaType: CTA_TYPES.OPEN_DASHBOARD,
    days: [6], // Saturday
    priority: 'P3',
    categories: ['ENGAGEMENT'],
    variants: [
      {
        title: 'Saturday: Rest day or beast day? 🌅',
        body: 'Even a 20-minute recovery walk or quick stretch logs XP and protects your daily streak.'
      },
      {
        title: 'Weekend mode active ☀️👟',
        body: 'Take your fitness outside! Outdoor run, cycling, or swimming — log your activity in Calyxo.'
      }
    ]
  },
  {
    id: 'sunday_reset_prep',
    family: THEME_FAMILIES.SUNDAY_RESET,
    tone: TONES.REFLECTIVE,
    hookType: HOOK_TYPES.IDENTITY,
    ctaType: CTA_TYPES.VIEW_PROGRESS,
    days: [0], // Sunday
    priority: 'P3',
    categories: ['ENGAGEMENT'],
    variants: [
      {
        title: 'Sunday Reset: Set the Pace 🧘‍♂️',
        body: 'Pre-plan your week and get a head start on your fitness targets.'
      },
      {
        title: 'Sunday Reset: Review your weekly wins 🔄📋',
        body: 'How did this week\'s volume and calories look? Tap to view your 7-day analytics and prep for tomorrow.'
      },
      {
        title: 'Sunday Shaam: Biryani digested? 🍗🍛',
        body: 'Weekend calories hit hard? No guilt! Lock in tomorrow morning’s workout and start the week like a boss.'
      },
      {
        title: 'New week starts in a few hours 🌅',
        body: 'Champions plan their week on Sunday night. Check your AI workout plan and set your targets.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 6. MOTIVATIONAL & IDENTITY-BASED THEMES
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'identity_consistent_athlete',
    family: THEME_FAMILIES.IDENTITY_BASED,
    tone: TONES.WARM,
    hookType: HOOK_TYPES.IDENTITY,
    ctaType: CTA_TYPES.OPEN_DASHBOARD,
    priority: 'P3',
    categories: ['ENGAGEMENT'],
    variants: [
      {
        title: 'You are the person who shows up 💎',
        body: 'Every single log, every workout, every glass of water is a vote for the person you\'re becoming.'
      },
      {
        title: 'Consistency > Motivation 📈',
        body: 'You don\'t need to feel like working out today. You just need to show up for 15 minutes.'
      }
    ]
  },
  {
    id: 'streak_celebrate_legend',
    family: THEME_FAMILIES.STREAK_CELEBRATE,
    tone: TONES.WARM,
    hookType: HOOK_TYPES.IDENTITY,
    ctaType: CTA_TYPES.VIEW_STREAK,
    priority: 'P3',
    categories: ['STREAK', 'ENGAGEMENT'],
    variants: [
      {
        title: 'Streak is burning bright! 🔥🏆',
        body: 'Day after day of showing up. That discipline is rare — be proud of the habit you\'ve built.'
      },
      {
        title: 'The momentum is unstoppable ⚡',
        body: 'Keep this streak alive today. It takes months to build and seconds to protect.'
      }
    ]
  },
  {
    id: 'comeback_fresh_start',
    family: THEME_FAMILIES.COMEBACK_STORY,
    tone: TONES.WARM,
    hookType: HOOK_TYPES.IDENTITY,
    ctaType: CTA_TYPES.OPEN_DASHBOARD,
    priority: 'P3',
    categories: ['ENGAGEMENT', 'STREAK'],
    variants: [
      {
        title: 'Plot twist: Today is the comeback 🔄✨',
        body: 'Missed a day? Doesn\'t matter. The best athletic stories are comeback stories. Start fresh right now.'
      },
      {
        title: 'Never waste a good reset 🎬',
        body: 'Yesterday is history. Today is Day 1 of your longest streak yet. Open Calyxo and let\'s begin.'
      }
    ]
  }
,

  // ══════════════════════════════════════════════════════════════════════════
  // 6. ANYTIME VIRAL MARKETING & IRRESISTIBLE ENGAGEMENT THEMES (24/7 DYNAMIC)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'midnight_fridge_raid_defence',
    family: THEME_FAMILIES.FRIDGE_TALK,
    tone: TONES.PLAYFUL,
    hookType: HOOK_TYPES.QUESTION,
    ctaType: CTA_TYPES.OPEN_DASHBOARD,
    priority: 'P3',
    categories: ['MARKETING', 'ENGAGEMENT'],
    variants: [
      {
        title: 'Midnight fridge raid detected? 🧊👀',
        body: 'Drink a glass of water first! Most late-night cravings are just dehydration in disguise.'
      },
      {
        title: 'Your muscles grow while you sleep 😴💪',
        body: "Close the tabs, put the phone down, and let your body synthesize today's hard work."
      },
      {
        title: 'Still scrolling? 📱',
        body: "Every hour of deep sleep tonight adds +5% recovery to tomorrow's training session. Sleep tight!"
      }
    ]
  },
  {
    id: 'morning_posture_and_water_boost',
    family: THEME_FAMILIES.WATER_BOTTLE,
    tone: TONES.PLAYFUL,
    hookType: HOOK_TYPES.CHALLENGE,
    ctaType: CTA_TYPES.LOG_WATER,
    priority: 'P3',
    categories: ['MARKETING', 'ENGAGEMENT'],
    variants: [
      {
        title: 'Quick 2-Second Posture Check 🪑⚡️',
        body: "Shoulders back, chin up, take a deep breath, and grab a sip of water. You're doing great."
      },
      {
        title: 'Coffee is good. Water is superpower ☕️💧',
        body: 'Down a tall glass of water to kickstart your metabolism and amplify morning focus.'
      }
    ]
  },
  {
    id: 'desi_biryani_fuel_hook',
    family: THEME_FAMILIES.INDIAN_FOOD,
    tone: TONES.DESI,
    hookType: HOOK_TYPES.ROLE_PLAY,
    ctaType: CTA_TYPES.LOG_WORKOUT,
    priority: 'P3',
    categories: ['MARKETING', 'ENGAGEMENT', 'WORKOUT'],
    variants: [
      {
        title: 'Dreaming of Biryani? 🍛🔥',
        body: "Crush today's workout and turn those delicious carbs into pure strength and athletic performance."
      },
      {
        title: '‘Beta, thoda workout bhi kar lo!’ 🏋️‍♂️',
        body: 'Even a 20-minute bodyweight pump keeps you ahead of 90% of people. Open Calyxo and start.'
      }
    ]
  },
  {
    id: 'gym_equipment_lonely',
    family: THEME_FAMILIES.GYM_SHOES,
    tone: TONES.CHAOTIC,
    hookType: HOOK_TYPES.PERSONIFICATION,
    ctaType: CTA_TYPES.LOG_WORKOUT,
    priority: 'P3',
    categories: ['MARKETING', 'ENGAGEMENT'],
    variants: [
      {
        title: 'Your gym shoes are staring at you 👟👀',
        body: "They're sitting by the door waiting for action. 30 minutes of sweat is all it takes today."
      },
      {
        title: "Dumbbells don't lift themselves 💪",
        body: 'The iron is waiting. Go claim your daily workout badge in Calyxo!'
      }
    ]
  },
  {
    id: 'unskippable_future_self',
    family: THEME_FAMILIES.FUTURE_SELF,
    tone: TONES.REFLECTIVE,
    hookType: HOOK_TYPES.IDENTITY,
    ctaType: CTA_TYPES.OPEN_DASHBOARD,
    priority: 'P3',
    categories: ['MARKETING', 'ENGAGEMENT'],
    variants: [
      {
        title: 'Your future self is thanking you 🚀',
        body: 'Every single log, sip of water, and workout session compounds into extraordinary transformation.'
      },
      {
        title: 'Consistency > Intensity 🔑',
        body: 'Showing up for 15 minutes today beats 2 hours once a week. Open Calyxo and keep your momentum.'
      }
    ]
  }

,

  // ══════════════════════════════════════════════════════════════════════════
  // 7. ULTRA-CHEESY, FLIRTY, BOLLYWOOD & HIGH-ATTRACTION MARKETING THEMES
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'cheesy_heart_rate_racer',
    family: THEME_FAMILIES.CHEESY_ROMANCE,
    tone: TONES.PLAYFUL,
    hookType: HOOK_TYPES.QUESTION,
    ctaType: CTA_TYPES.LOG_WORKOUT,
    priority: 'P3',
    categories: ['MARKETING', 'ENGAGEMENT', 'WORKOUT'],
    variants: [
      {
        title: "Are you a workout? Because my heart races every time 💓",
        body: "Don't leave your fitness on read. 20 minutes of movement today is all I ask ✨"
      },
      {
        title: "Are we in a relationship? 💍👀",
        body: "Because I literally cannot stop checking if you logged your water and meals today."
      }
    ]
  },
  {
    id: 'cheesy_cutest_lifter_award',
    family: THEME_FAMILIES.CHEESY_ROMANCE,
    tone: TONES.WARM,
    hookType: HOOK_TYPES.IDENTITY,
    ctaType: CTA_TYPES.LOG_WORKOUT,
    priority: 'P3',
    categories: ['MARKETING', 'ENGAGEMENT'],
    variants: [
      {
        title: "Rumor has it you're the best-looking athlete today 😉",
        body: "Go prove the rumors right. Grab your gym gear and claim a new personal record in Calyxo!"
      },
      {
        title: "My love language? Seeing you crush your goals 💌",
        body: "A clean nutrition log and a solid workout makes my algorithmic heart skip a beat."
      },
      {
        title: "You give me butterflies (or maybe it's pre-workout) 🦋⚡️",
        body: "Either way, the energy is electric. Channel that fire into today's training session!"
      }
    ]
  },
  {
    id: 'bollywood_tum_paas_aaye',
    family: THEME_FAMILIES.BOLLYWOOD_CHEESY,
    tone: TONES.DESI,
    hookType: HOOK_TYPES.ROLE_PLAY,
    ctaType: CTA_TYPES.LOG_MEAL,
    priority: 'P3',
    categories: ['MARKETING', 'ENGAGEMENT', 'NUTRITION'],
    variants: [
      {
        title: "Tum paas aaye... yun muskuraye... 🎶",
        body: "Aur protein shake pina bhool gaye? Aise kaise chalega! Quick 30-sec meal log karo."
      },
      {
        title: "Paneer butter masala without a workout? 🍛💔",
        body: "Dil toota hai, par calories zinda hain! Burn them off before dinner rolls around."
      },
      {
        title: "Kuch kuch hota hai jab streak tootti hai... 🚨",
        body: "Don't let a missed day break your streak romance. Open Calyxo and lock it in now!"
      }
    ]
  },
  {
    id: 'sholay_kitne_reps_the',
    family: THEME_FAMILIES.BOLLYWOOD_CHEESY,
    tone: TONES.DESI,
    hookType: HOOK_TYPES.CHALLENGE,
    ctaType: CTA_TYPES.LOG_WORKOUT,
    priority: 'P3',
    categories: ['MARKETING', 'ENGAGEMENT', 'WORKOUT'],
    variants: [
      {
        title: "‘Kitne reps the?’ — Gabbar Singh 🤠💥",
        body: "Sardar, pure 3 sets kiye! Log your workout now to claim your champion badge."
      },
      {
        title: "Chai ho gayi, ab workout ki baari ☕️➡️🏋️",
        body: "Your evening fitness slot is live. Show up, break a sweat, and own the scoreboard."
      }
    ]
  },
  {
    id: 'main_character_glow_up_hook',
    family: THEME_FAMILIES.MAIN_CHARACTER,
    tone: TONES.COMPETITIVE,
    hookType: HOOK_TYPES.IDENTITY,
    ctaType: CTA_TYPES.OPEN_DASHBOARD,
    priority: 'P3',
    categories: ['MARKETING', 'ENGAGEMENT'],
    variants: [
      {
        title: "Main Character energy only 👑✨",
        body: "You didn't wake up to be average. Drink your water, crush your workout, and look phenomenal."
      },
      {
        title: "VIP Access Granted: Peak Performance Club 🎟️💎",
        body: "Entry ticket: 1 logged workout + 2500ml water. Tap to inspect your status."
      },
      {
        title: "That post-workout pump deserves a mirror selfie 📸🔥",
        body: "Earn the pump first! 25 minutes of lifting and you'll be feeling unstoppable."
      }
    ]
  },
  {
    id: 'gym_crush_leg_day',
    family: THEME_FAMILIES.GYM_CRUSH,
    tone: TONES.PLAYFUL,
    hookType: HOOK_TYPES.QUESTION,
    ctaType: CTA_TYPES.LOG_WORKOUT,
    priority: 'P3',
    categories: ['MARKETING', 'ENGAGEMENT'],
    variants: [
      {
        title: "Your gym crush is looking for someone who doesn't skip leg day 🦵👀",
        body: "Don't let them down! Get under the squat rack and own the room."
      },
      {
        title: "Spotify Wrapped for Fitness is watching 🎧📈",
        body: "Don't let your top genre be 'Procrastination Beats'. Open Calyxo and log your sweat."
      }
    ]
  },
  {
    id: 'duolingo_crying_dumbbell',
    family: THEME_FAMILIES.DUOLINGO_GUILT,
    tone: TONES.CHAOTIC,
    hookType: HOOK_TYPES.PERSONIFICATION,
    ctaType: CTA_TYPES.LOG_WORKOUT,
    priority: 'P3',
    categories: ['MARKETING', 'ENGAGEMENT'],
    variants: [
      {
        title: "Your 10kg dumbbell is crying in the corner 🥺",
        body: "It says: 'Why does nobody lift me anymore?' Go make peace with the weights."
      },
      {
        title: "Your water bottle wrote you a love letter 💌💧",
        body: "It misses your attention. Take 3 huge gulps and log 500ml right now."
      },
      {
        title: "The couch is plotting against your six-pack 🛋️🕵️",
        body: "It's trying to trap you with soft cushions. Stand up, break free, and move!"
      }
    ]
  }

];

// ── Theme Query & Selector Utilities ────────────────────────────────────────

/**
 * Filter available themes matching criteria while excluding recently cooled-down families
 */
export function filterAvailableThemes({
  category = null,
  dayOfWeek = null,
  blockedFamilies = new Set(),
  blockedThemeIds = new Set(),
  priority = null,
  isWorkoutDone = false,
  isWaterDone = false
}) {
  return NOTIFICATION_THEMES.filter(theme => {
    // 1. Category check
    if (category && !theme.categories.includes(category)) {
      return false;
    }

    // 2. Day-of-week affinity check (if theme specifies specific days)
    if (dayOfWeek !== null && Array.isArray(theme.days) && theme.days.length > 0) {
      if (!theme.days.includes(dayOfWeek)) return false;
    }

    // 3. Theme Family cooldown check (Semantic Deduplication)
    if (blockedFamilies && blockedFamilies.has(theme.family)) {
      return false;
    }

    // 4. Exact Theme ID cooldown check
    if (blockedThemeIds && blockedThemeIds.has(theme.id)) {
      return false;
    }

    // 5. Priority filter
    if (priority && theme.priority !== priority) {
      return false;
    }

    // 6. User State context overrides
    // If workout is already completed, exclude pure workout-nudge themes
    if (isWorkoutDone && theme.categories.includes('WORKOUT') && !theme.categories.includes('BRIEFING')) {
      return false;
    }

    // If water target is met, exclude water reminders
    if (isWaterDone && theme.categories.includes('HYDRATION')) {
      return false;
    }

    return true;
  });
}

/**
 * Deterministically pick a copy variant using a hash seed (userId + date)
 */
export function pickThemeVariant(theme, seedString = '', blockedTitles = new Set()) {
  if (!theme || !Array.isArray(theme.variants) || theme.variants.length === 0) {
    return { title: 'Calyxo Update', body: 'Stay on track with your health goals today.' };
  }
  const unUsedVariants = theme.variants.filter(v => !blockedTitles.has(v.title));
  const candidatePool = unUsedVariants.length > 0 ? unUsedVariants : theme.variants;

  const hash = Math.abs(seedString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  return candidatePool[hash % candidatePool.length];
}