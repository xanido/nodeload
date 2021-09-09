const dns = require('dns');
const http = require('http');

console.time('total');

// KNOBS

// This defaults to Infinity :brain_explode:
// Tweaking it to a smaller number will increase overall run time, and also
// increase memory (albeit slightly), but should reduce the frequency of timeouts.
// Could only find some cryptic references as to why reducing it reduces timeouts,
// nothing satisfying:
//
//    "Lowering this value can reduce the number of throttling or timeout errors received"
//    https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/node-configuring-maxsockets.html
//
//    "The default maxSockets of 50 was added in AWS SDK for JavaScript (v2) for performance tuning in v2.4.7"
//    https://github.com/aws/aws-sdk-js-v3/issues/1959
//
// http.globalAgent.maxSockets = 32;

// Tweak the volume of requests. Batch of 100 seems to produce errors reasonably reliably.
const BATCH_SIZE = 100;

// Uncomment this to opt-out of the system DNS lookup and instead use the JS implementation
const OPTIONS = {
  // lookup: function (hostname, args, cb) {
  //   return dns.resolve4(hostname, function (err, ips) {
  //     if (err) { return cb(err); }
  //     return cb(null, ips[0], 4);
  //   });
  // },
}

// END KNOBS

const stats = {
  started: 0,
  completed: 0,
  failed: 0,
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  for (let i = 0; i < 100; i++) {
    await sleep(1);
    Promise.all(
      new Array(BATCH_SIZE).fill(null).map((_, j) =>
        new Promise(resolve => {
          const iteration = i * BATCH_SIZE + j;
          console.time(iteration);
          stats.started++;
          // this 
          http.get('http://xanido.net', OPTIONS, (resp) => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
              data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
              stats.completed++;
              console.timeEnd(iteration);
            });

          }).on("error", (err) => {
            stats.failed++;
            console.timeEnd(iteration);
            console.log(err);
          })
        })
      )
    );
    process.stdout.write('.');
  }
}

process.on('beforeExit', (code) => {
  console.timeEnd('total');
  console.log(stats);
});

demo();
