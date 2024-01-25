/**
 * Filter Pull Requests with requested reviewers only
 * @param {Array} pullRequests Pull Requests to filter
 * @return {Array} Pull Requests to review
 */
function getPullRequestsToReview(pullRequests) {
  return pullRequests.filter((pr) => pr.requested_reviewers.length || pr.requested_teams.length);
}

/**
 * Filter Pull Requests without a specific label
 * @param {Array} pullRequests Pull Requests to filter
 * @param {String} ignoreLabels Pull Request label(s) to ignore
 * @return {Array} Pull Requests without a specific label
 */
function getPullRequestsWithoutLabel(pullRequests, ignoreLabels) {
  const ignoreLabelsArray = ignoreLabels.replace(/\s*,\s*/g, ',').split(','); // ['ignore1', 'ignore2', ...]
  const ignoreLabelsSet = new Set(ignoreLabelsArray);
  return pullRequests.filter((pr) => !((pr.labels || []).some((label) => ignoreLabelsSet.has(label.name))));
}

/**
 * Count Pull Requests reviewers
 * @param {Array} pullRequests Pull Requests
 * @return {Number} Reviewers number
 */
function getPullRequestsReviewersCount(pullRequests) {
  return pullRequests.reduce((total, pullRequest) => (total + pullRequest.requested_reviewers.length), 0);
}

/**
 * Create an Array of Objects with { url, title, login } properties from a list of Pull Requests
 * @param {Array} pullRequestsToReview Pull Requests
 * @return {Array} Array of Objects with { url, title, login } properties
 */
function createPr2UserArray(pullRequestsToReview) {
  const pr2user = [];
  for (const pr of pullRequestsToReview) {
    for (const user of pr.requested_reviewers) {
      pr2user.push({
        url: pr.html_url,
        title: pr.title,
        login: user.login,
      });
    }
    for (const team of pr.requested_teams) {
      pr2user.push({
        url: pr.html_url,
        title: pr.title,
        login: team.slug,
      });
    }
  }
  return pr2user;
}

/**
 * Check if the github-provider-map string is in correct format
 * @param {String} str String to be checked to be in correct format
 * @return {Boolean} String validity as boolean
 */
function checkGithubProviderFormat(str) {
  // Pattern made with the help of ChatGPT
  const az09 = '[A-z0-9_\\-@\\.]+';
  const pattern = new RegExp(`^${az09}:${az09}(,\\s*${az09}:${az09})*$`, 'm');
  return pattern.test(str);
}

/**
 * Convert a string like "name1:ID123,name2:ID456" to an Object { name1: "ID123", name2: "ID456"}
 * @param {String} str String to convert to Object
 * @return {Object} Object with usernames as properties and IDs as values
 */
function stringToObject(str) {
  const map = {};
  if (!str) {
    return map;
  }
  const users = str.replace(/[\s\r\n]+/g, '').split(',');
  users.forEach((user) => {
    const [github, provider] = user.split(':');
    map[github] = provider;
  });
  return map;
}

function getRandomString(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

/**
 * Gets a random phrase (generated by ChatGPT) with which to prompt people to review code
 */
function getRandomStatement() {
  const prReminders = [
        "${mention}: Warning: This <$url|PR> is about to reach its 'best by' date. Your review could be just the freshness it needs!",
    "${mention}: Did you hear the latest gossip? This <$url|PR> is dying for your approval. Spill the tea!",
    "${mention}: This <$url|PR> is like a lost puppy at the park—eagerly waiting for you to take it home with your review.",
    "${mention}: Our fortune teller predicts a reviewed <$url|PR> in your near future. Don't let fate down!",
    "${mention}: This <$url|PR> is currently practicing puppy eyes in the mirror, hoping to get your attention.",
    "${mention}: Be the superhero this <$url|PR> needs and save it with your super-powered review!",
    "${mention}: This <$url|PR> is feeling a bit like Cinderella—waiting for its fairy god-reviewer to work some magic.",
    "${mention}: If this <$url|PR> were a reality TV show, it would be called 'Waiting for Review: The Untold Story'.",
    "${mention}: This <$url|PR> just signed up for a marathon. Help it cross the finish line with your review!",
    "${mention}: Like a message in a bottle, this <$url|PR> is adrift in the sea of code, waiting for a rescuer.",
    "${mention}: This <$url|PR> is trying to win a talent show. Your review is the golden buzzer it's hoping for!",
    "${mention}: If this <$url|PR> could talk, it would probably say, 'Hey, remember me? I could use some love!'",
    "${mention}: This <$url|PR> is like a garden gnome, quietly waiting in the background for your nod of approval.",
    "${mention}: Think of this <$url|PR> as a needy houseplant—it needs your review to thrive and grow!",
    "${mention}: This <$url|PR> is like a kid's letter to Santa, full of hope and waiting for a miracle—your review!",
    "${mention}: This <$url|PR> is channeling its inner zen, patiently awaiting the enlightenment of your feedback.",
    "${mention}: Consider this <$url|PR> your very own 'Choose Your Own Adventure' book. Ready to turn the page?",
    "${mention}: This <$url|PR> might not be a pot of gold, but your review is the rainbow it's been waiting for!",
    "${mention}: Like a vintage wine, this <$url|PR> is just sitting in the cellar, waiting for its perfect connoisseur.",
    "${mention}: This <$url|PR> is the 'Where's Waldo?' of code, hoping you'll spot it soon!",
    "${mention}: In the opera of code, this <$url|PR> is the diva awaiting your applause. Curtain call!",
    "${mention}: This <$url|PR> is like a lone sock looking for its pair. Help it find its match with your review!",
    "${mention}: Imagine this <$url|PR> as a lonely satellite, beaming signals for your feedback from outer space.",
    "${mention}: This <$url|PR> is pretending to be a secret agent. Your mission, should you choose to accept it, involves a thrilling review!",
    "${mention}: Like a forgotten lyric in a song, this <$url|PR> is waiting for you to sing its tune.",
    "${mention}: This <$url|PR> is practicing its puppy eyes. Don't fall for it—just review it!",
    "${mention}: Ever seen a <$url|PR> do a handstand? Me neither, but a review might be the encouragement it needs!",
    "${mention}: This <$url|PR> is like a forgotten cup of tea—cooling off and patiently waiting for your warmth.",
    "${mention}: In the world of <$url|PR>s, this one is casting longing glances your way. It's crushin' hard!",
    "${mention}: Like a quiet kid in class, this <$url|PR> is raising its hand, hoping you'll call on it.",
    "${mention}: This <$url|PR> is like a guest at a party, awkwardly waiting for someone to talk to it.",
    "${mention}: Think of this <$url|PR> as a time capsule, eagerly awaiting your discoveries inside.",
    "${mention}: This <$url|PR> is like a game of hide and seek, and it's really hoping you'll find it soon.",
    "${mention}: In the library of code, this <$url|PR> is a book that's been checked out by you—time to read!",
    "${mention}: This <$url|PR> is a lonely planet in your code universe, awaiting exploration by astronaut you.",
    "${mention}: Consider this <$url|PR> a mystery novel, and you're the detective on the case. Time to crack it open!",
    "${mention}: This <$url|PR> is like a game of chess, silently challenging you to make your move.",
    "${mention}: Imagine this <$url|PR> as a silent movie star, waiting for your voice to bring it to life.",
    "${mention}: This <$url|PR> is like a message in a fortune cookie, curious to see if you'll take its advice.",
    "${mention}: Like a forgotten melody, this <$url|PR> hums quietly, hoping you'll pick up the tune.",
    "${mention}: Think of this <$url|PR> as a campfire story, waiting for your twist to make it legendary.",
    "${mention}: This <$url|PR> is like a riddle wrapped in a mystery, inside an enigma, awaiting your insight.",
    "${mention}: In the realm of the forgotten, this <$url|PR> is hoping you'll be its knight in shining armor.",
    "${mention}: This <$url|PR> is the 'Blue's Clues' of code, leaving paw prints and waiting for you to solve the puzzle.",
    "${mention}: Like a stranded astronaut, this <$url|PR> is sending out distress signals for your review.",
    "${mention}: Consider this <$url|PR> a secret handshake, waiting for you to unlock its mysteries.",
    "${mention}: This <$url|PR> is like a message in a bottle, tossed into the sea of code, hoping you'll find it.",
    "${mention}: In the kitchen of development, this <$url|PR> is a simmering pot, ready for your tasting spoon.",
    "${mention}: This <$url|PR> is like a lost tourist in your city of code, looking for directions—your review!",
    "${mention}: Imagine this <$url|PR> as a quiet observer at a party, hoping you'll strike up a conversation.",
    "${mention}: This <$url|PR> is like a sudoku puzzle, patiently waiting for you to fill in the missing numbers.",
    "${mention}: Like a vintage comic book, this <$url|PR> is hidden away, waiting for a collector's keen eye—yours!",
    "${mention}: This <$url|PR> is the Loch Ness Monster of your codebase, elusive but eagerly awaiting your discovery.",
    "${mention}: In the symphony of development, this <$url|PR> is a solo waiting for your conductive cue.",
    "${mention}: Think of this <$url|PR> as a secret garden, its gates eagerly awaiting your key of insight.",
    "${mention}: This <$url|PR> is like a hidden Easter egg in a video game, waiting for the right player—you!",
    "${mention}: Consider this <$url|PR> a buried treasure on your map of code, X marks the spot for your review.",
    "${mention}: This <$url|PR> is the unsung hero of your codebase, quietly waiting for its moment in the spotlight.",
    "${mention}: Imagine this <$url|PR> as a vintage car in your garage, ready for a spin around the block—your review.",
    "${mention}: This <$url|PR> is like a wallflower at the dance, hoping you'll be the one to ask it to boogie.",
    "${mention}: Just a nudge from your friendly neighborhood code whisperer: that <$url|PR> isn't going to review itself!",
    "${mention}: Rumor has it, reviewing this <$url|PR> grants you three wishes. First wish: review the <$url|PR>!",
    "${mention}: In a galaxy far, far away, there's a lonely <$url|PR> just waiting for your sage wisdom!",
    "${mention}: This <$url|PR> has been feeling a bit neglected lately. Maybe your review could be its new best friend?",
    "${mention}: Legend says, only the bravest can review this <$url|PR>. Are you the hero it's been waiting for?",
    "${mention}: If this <$url|PR> were a puppy, it would be giving you the 'please adopt me' eyes right now.",
    "${mention}: Knock, knock! Who's there? A <$url|PR> waiting for your review. No joke!",
    "${mention}: We've heard your review skills are magical. Care to cast a spell on this <$url|PR>?",
    "${mention}: If <$url|PR> reviews were a sport, we're pretty sure you'd be in the hall of fame. Ready to play?",
    "${mention}: This <$url|PR> is baking in the sun! Give it some shade with your cool review.",
    "${mention}: They say not all heroes wear capes, but your review might just save the day for this <$url|PR>!",
    "${mention}: This <$url|PR> thinks you're pretty awesome and would love to get to know your thoughts.",
    "${mention}: Our crystal ball predicts a future where you've reviewed this <$url|PR>...let's make it happen!",
    "${mention}: Like a fine wine, this <$url|PR> is just waiting to be uncorked by your expert review.",
    "${mention}: We interrupt your regularly scheduled scrolling for this important message: <$url|PR> review needed!",
    "${mention}: If reviewing this <$url|PR> was a video game, we bet you'd score the high score!",
    "${mention}: This <$url|PR> is like a treasure chest, and your review is the key. Ready to unlock it?",
    "${mention}: Psst, your mission, should you choose to accept it: review this <$url|PR>. This message will self-destruct in 3...2...1...",
    "${mention}: This <$url|PR> is currently auditioning for the role of 'Reviewed'. Think you could be the director?",
    "${mention}: Imagine this <$url|PR> is a message in a bottle, floating in the sea of code, waiting to be discovered by you.",
    "${mention}: This <$url|PR> is dressed up in its Sunday best, just waiting for a moment with you!",
    "${mention}: Like a lonely astronaut in space, this <$url|PR> is sending out signals for your attention.",
    "${mention}: This <$url|PR> is like a curious cat, peeking around the corner, hoping you'll play.",
    "${mention}: Imagine this <$url|PR> as a friendly ghost in your machine, just wanting a hello (and a review)!",
    "${mention}: This <$url|PR> is the secret ingredient in your code soup, ready to be tasted.",
    "${mention}: If this <$url|PR> were a song, it'd be a catchy tune waiting for your remix.",
    "${mention}: This <$url|PR> is like a disco ball in your code party, silently asking for a dance.",
    "${mention}: Consider this <$url|PR> a hidden gem in the treasure chest of your repository, awaiting discovery.",
    "${mention}: This <$url|PR> is like a yoga pose, waiting patiently for your balancing touch.",
    "${mention}: If this <$url|PR> could, it would serenade you under the moonlight, asking for your thoughts.",
    "${mention}: Like a message tied to a pigeon's leg, this <$url|PR> is fluttering around for your attention.",
    "${mention}: Think of this <$url|PR> as your secret admirer, shyly waiting in the wings of your codebase.",
    "${mention}: This <$url|PR> is like a sunflower, turning its face towards the sunshine of your review.",
    "${mention}: Imagine this <$url|PR> as a puzzle piece, eagerly waiting to fit into your project's big picture.",
    "${mention}: This <$url|PR> is the wallflower at your code prom, hoping you'll ask it to dance.",
    "${mention}: If this <$url|PR> were a book, it'd be an adventure story waiting for your next chapter.",
    "${mention}: This <$url|PR> is like a kite stuck in a tree, hoping you'll come to its rescue.",
    "${mention}: Consider this <$url|PR> a time traveler from the future, seeking your wisdom in the present.",
    "${mention}: This <$url|PR> is like a cheeky parrot, mimicking your name in hopes of a review.",
    "${mention}: If this <$url|PR> were a board game, it'd be missing just one piece: your review.",
    "${mention}: This <$url|PR> is like a treasure map, and X marks the spot of your insightful feedback.",
    "${mention}: Imagine this <$url|PR> as a friendly dragon from your code kingdom, seeking an audience with you.",
    "${mention}: This <$url|PR> is the Robin to your Batman in the code world, waiting for a signal.",
    "${mention}: If this <$url|PR> were a planet, it'd be orbiting the sun of your expertise, awaiting a landing.",
    "${mention}: This <$url|PR> is like a game of tag, and guess what? You're 'it'!",
    "${mention}: Consider this <$url|PR> a magic lamp, just waiting for your rub to release its potential.",
    "${mention}: This <$url|PR> is like a hopeful audition on a talent show, waiting for your golden buzzer.",
    "${mention}: If this <$url|PR> were a garden, it'd be a flower waiting for your sunshine to bloom.",
    "${mention}: This <$url|PR> is the unsung hero in your code saga, waiting for its moment of glory.",
    "${mention}: Imagine this <$url|PR> as a lone knight seeking the counsel of wise wizard—you!",
    "${mention}: This <$url|PR> is like a star in your code's night sky, twinkling for your attention.",
    "${mention}: If this <$url|PR> were a movie, it'd be a cliffhanger waiting for your epic conclusion.",
    "${mention}: This <$url|PR> is like a patient fisherman, waiting for the catch of your feedback.",
    "${mention}: Consider this <$url|PR> a mystery novel, with you as the detective on the case.",
    "${mention}: This <$url|PR> is a lone cowboy in the Wild West of your code, waiting for a partner.",
    "${mention}: If this <$url|PR> were a comic strip, it'd be a character looking for your next speech bubble.",
    "${mention}: This <$url|PR> is like a silent mime, performing an act that only you can interpret.",
    "${mention}: Imagine this <$url|PR> as a lost artifact, waiting to be rediscovered by your expertise.",
    "${mention}: This <$url|PR> is a lone wolf howling in the code wilderness, seeking your guidance.",
    "${mention}: If this <$url|PR> were a TV series, it'd be on the season finale cliffhanger, awaiting your review.",
    "${mention}: This <$url|PR> is like a vintage radio, crackling with anticipation for your tune-in.",
    "${mention}: Consider this <$url|PR> a loyal steed in the kingdom of code, awaiting its knight's command.",
    "${mention}: This <$url|PR> is the quiet student in class, raising a hand for your attention.",
    "${mention}: If this <$url|PR> were a painting, it'd be an unfinished masterpiece waiting for your brush.",
    "${mention}: This <$url|PR> is like a lighthouse beacon, shining out for your guiding review.",
    "${mention}: Imagine this <$url|PR> as a patient tailor, measuring and waiting for your final fitting.",
    "${mention}: This <$url|PR> is a budding magician, ready to pull a rabbit out of a hat with your help.",
    "${mention}: If this <$url|PR> were a spaceship, it'd be in orbit, awaiting your command to land.",
    "${mention}: This <$url|PR> is like a chess game in suspense, waiting for your master move.",
    "${mention}: Consider this <$url|PR> a poetic verse, waiting for your rhyming couplet of feedback.",
    "${mention}: This <$url|PR> is the long-lost Atlantis of your code, surfacing for your exploration.",
    "${mention}: If this <$url|PR> were a diary, it'd be full of secrets, waiting for your eyes only.",
    "${mention}: This <$url|PR> is like a secret handshake, waiting for your part to make it complete.",
    "${mention}: Imagine this <$url|PR> as a lone traveler on a quest, seeking the wisdom of a sage—you!",
    "${mention}: This <$url|PR> is the unsolved riddle in the escape room of your codebase, waiting for your solution.",
    "${mention}: If this <$url|PR> were a sports game, it'd be halftime with the team waiting for your pep talk.",
    "${mention}: This <$url|PR> is like a campfire story, waiting for your twist to make it legendary.",
    "${mention}: Consider this <$url|PR> a stranded alien, looking to you for a guide on planet Code.",
    "${mention}: This <$url|PR> is a lone sentinel in your digital empire, awaiting your royal decree.",
    "${mention}: If this <$url|PR> were a jazz tune, it'd be a solo waiting for your improvisation.",
    "${mention}: This <$url|PR> is like a vintage typewriter, eager for your keystrokes of wisdom.",
    "${mention}: Imagine this <$url|PR> as a noble quest in the realm of code, awaiting its brave knight.",
    "${mention}: This <$url|PR> is the lone puzzle piece missing from the jigsaw of your project.",
    "${mention}: If this <$url|PR> were a detective novel, it'd be a case waiting for your keen solving.",
    "${mention}: This <$url|PR> is a quiet observer at a party, hoping you'll engage in a deep conversation.",
    "${mention}: Consider this <$url|PR> a forgotten melody, waiting for your voice to sing it back to life.",
    "${mention}: This <$url|PR> is like a hidden door in a library, waiting for your curious push.",
    "${mention}: If this <$url|PR> were a game of hide-and-seek, it would be silently pleading, 'find me!'",
    "${mention}: This <$url|PR> is a wanderer in the desert of code, looking for an oasis of your review.",
    "${mention}: Imagine this <$url|PR> as a message in a bottle, floating on the sea of your inbox, waiting for rescue.",
    "${mention}: This <$url|PR> is like a budding actor on stage, eagerly awaiting your direction."
  ];

  return getRandomString(prReminders).concat("\n");
}

function applyTemplate(template, values) {
  return template.replace(/\${(.*?)}/g, (_, g1) => values[g1]);
}

/**
 * Create a pretty message to print
 * @param {Array} pr2user Array of Object with these properties { url, title, login }
 * @param {Object} github2provider Object containing usernames as properties and IDs as values
 * @param {String} provider Service to use: slack or msteams
 * @return {String} Pretty message to print
 */
function prettyMessage(pr2user, github2provider, provider) {
  let message = '';
  for (const obj of pr2user) {
    switch (provider) {
      case 'slack': {
        const mention = github2provider[obj.login] ?
          `<@${github2provider[obj.login]}>` :
          `@${obj.login}`;
        const args = {
          url: obj.url,
          mention: mention
        };
        statement = getRandomStatement()
        message += applyTemplate(statement, args);
        break;
      }
      case 'rocket': {
        const mention = github2provider[obj.login] ?
                `<@${github2provider[obj.login]}>` :
                `@${obj.login}`;
        message += `Hey ${mention}, the PR "${obj.title}" is waiting for your review: ${obj.url}\n`;
        break;
      }
      case 'msteams': {
        const mention = github2provider[obj.login] ?
          `<at>${obj.login}</at>` :
          `@${obj.login}`;
        message += `Hey ${mention}, the PR "${obj.title}" is waiting for your review: [${obj.url}](${obj.url})  \n`;
        break;
      }
    }
  }
  return message;
}

/**
 * Create an array of MS teams mention objects for users requested in a review
 * Docs: https://bit.ly/3UlOoqo
 * @param {Object} github2provider Object containing usernames as properties and IDs as values
 * @param {Array} pr2user Array of Object with these properties { url, title, login }
 * @return {Array} MS teams mention objects
 */
function getTeamsMentions(github2provider, pr2user) {
  const mentions = [];
  // Add mentions array only if the map is provided, or no notification is sent
  if (Object.keys(github2provider).length > 0) {
    for (const user of pr2user) {
      // mentioed property needs id and name, or no notification is sent
      if (github2provider[user.login]) {
        mentions.push({
          type: `mention`,
          text: `<at>${user.login}</at>`,
          mentioned: {
            id: github2provider[user.login],
            name: user.login,
          },
        });
      }
    }
  }
  return mentions;
}

/**
 * Formats channel and slack message text into a request object
 * @param {String} channel channel to send the message to
 * @param {String} message slack message text
 * @return {Object} Slack message data object
 */
function formatSlackMessage(channel, message) {
  const messageData = {
    channel: channel,
    username: 'Pull Request reviews reminder',
    text: message,
  };
  return messageData;
}

/**
 * Formats channel and rocket message text into a request object
 * @param {String} channel channel to send the message to
 * @param {String} message rocket message text
 * @return {Object} rocket message data object
 */
function formatRocketMessage(channel, message) {
  const messageData = {
    channel: channel,
    username: 'Pull Request reviews reminder',
    text: message,
  };
  return messageData;
}

/**
 * Format the MS Teams message request object
 * Docs: https://bit.ly/3UlOoqo
 * @param {String} message formatted message string
 * @param {Array} [mentionsArray] teams mention objects array
 * @return {Object} Ms Teams message data object
 */
function formatTeamsMessage(message, mentionsArray = []) {
  const messageData = {
    type: `message`,
    attachments: [
      {
        contentType: `application/vnd.microsoft.card.adaptive`,
        content: {
          type: `AdaptiveCard`,
          body: [
            {
              type: `TextBlock`,
              text: message,
              wrap: true,
            },
          ],
          $schema: `http://adaptivecards.io/schemas/adaptive-card.json`,
          version: `1.0`,
          msteams: {
            width: 'Full',
            entities: mentionsArray,
          },
        },
      },
    ],
  };

  return messageData;
}

module.exports = {
  getPullRequestsToReview,
  getPullRequestsWithoutLabel,
  getPullRequestsReviewersCount,
  createPr2UserArray,
  checkGithubProviderFormat,
  stringToObject,
  prettyMessage,
  getTeamsMentions,
  formatTeamsMessage,
  formatRocketMessage,
  formatSlackMessage,
};
