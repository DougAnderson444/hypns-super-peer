// node multichat.js 1  // in one terminal
// node multichat.js 2  // in other terminal

const hcrypto = require("hypercore-crypto");
var crypto = require("crypto");

const Corestore = require("corestore");
const SwarmNetworker = require("@corestore/networker");

const Multifeed = require("hypermultifeed");
const MultifeedNetworker = require("hypermultifeed/networker");

var kappa = require("kappa-core");
var list = require("kappa-view-list");
var memdb = require("level-mem");

if (process.argv.length !== 3) {
  console.log('USAGE: "node multifeed.js 1" or "node multifeed.js 2"');
  process.exit(1);
  return;
}
var num = process.argv[2];

const store = new Corestore("multichat-store-" + num);

const swarmOpts = { }; // queue: { multiplex: true } // already done in networker for us // bootstrap: false
const swarmNetworker = new SwarmNetworker(store, swarmOpts);
var network = new MultifeedNetworker(swarmNetworker); // multi + network = swarm

const seedPhrase = "our-topic";
seed = crypto.createHash("sha256").update(seedPhrase).digest(); // seed needs to be 32 bytes
rootKey = hcrypto.keyPair(seed).publicKey; //topic

console.log("rootKey: ", rootKey.toString("hex"));
console.log(
  "topic: ",
  hcrypto.discoveryKey(Buffer.from(rootKey, "hex")).toString("hex")
);
var multi = new Multifeed(store, { rootKey, valueEncoding: "json" });

network.swarm(multi);
network.networker.on("peer-add", (peer) => {
  console.log("New peer added!"); //peer.remotePublicKey.toString("hex")
});

/**
 * KAPPA VIEWS of the multifeed
 */
// setup the kappa view
var timestampView = list(memdb(), function (msg, next) {
  if (msg.value.timestamp && typeof msg.value.timestamp === "string") {
    // sort on the 'timestamp' field
    next(null, [msg.value.timestamp]);
  } else {
    next();
  }
});
// pass in the multifeed we created above, kappa-core will use it as foundation
var core = kappa(store, { multifeed: multi }); // store doesn't get used since we passed in a multi
core.use("chats", timestampView);

core.ready("chats", () => {
  console.log(`chats ready`);
  core.writer("kappa-local", function (err, feed) {
    if (err) console.error(err);
    core.api.chats.ready(() => {
      console.log(`chats api ready`);
      core.api.chats.tail(5, function (msgs) {
        console.log("--------------");
        msgs.forEach(function (msg, i) {
          console.log(
            `${i + 1} - ${msg.value.nickname} ${msg.value.timestamp}: ${
              msg.value.text
            }`
          );
        });
      });
    });
    feed.ready(() => {
      watchStdin(feed);
    });
  });
});
core.ready(() => {});
function watchStdin(feed) {
  process.stdin.on("data", function (data) {
    feed.append({
      type: "chat-message",
      nickname: "cat-lover",
      text: data.toString().trim(),
      timestamp: new Date().toISOString(),
    });
  });
}
