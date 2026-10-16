global.window = {}; require("../wbs-image-rules.js");
const R = window.WBSImageRules, a = require("assert");
const KB=1000;
a.equal(R.classify(5000,5000,400*KB),"ok_small");
a.equal(R.classify(1024,1024,900*KB),"ok_dims");
a.equal(R.classify(1025,800,900*KB),"scale");
a.equal(R.classify(800,1025,500*KB),"ok_small"); // exactly 500 KB is fine
a.equal(R.classify(6500,6500,4000*KB),"scale");
a.equal(R.classify(6501,100,100*KB),"oversize");
a.equal(R.classify(10000,10000,40000*KB),"oversize");
a.deepEqual(R.targetSize("scale",4000,3000),{width:1024,height:768});
a.deepEqual(R.targetSize("scale",3000,4000),{width:768,height:1024});
a.deepEqual(R.targetSize("oversize",10000,10000),{width:6501,height:6501});
a.deepEqual(R.targetSize("oversize",12000,3000),{width:6501,height:1625});
a.equal(R.targetSize("ok_small",1,1),null);
a.equal(R.accepted(1024,768,2000*KB),true);
a.equal(R.accepted(6500,6500,4000*KB),false);
a.equal(R.accepted(6501,6501,4000*KB),true);

// Search helpers, with a fake encoder: size grows with quality and with pixel area.
(async () => {
  const LIM = R.LIMITS.SIZE_LIMIT;
  const fakeQ = base => async q => ({ size: Math.round(base * (0.2 + q)), q });
  let r = await R.searchQuality(fakeQ(400 * KB), 0.7, 0.92, LIM, true);
  a.equal(r.q, 0.92);                                   // fits at top quality, no search
  r = await R.searchQuality(fakeQ(500 * KB), 0.7, 0.92, LIM, true);
  a.ok(r && r.size <= LIM && r.q >= 0.7 && r.q < 0.92); // highest quality that fits
  a.equal(await R.searchQuality(fakeQ(900 * KB), 0.7, 0.92, LIM, true), null);  // can't fit
  a.equal(await R.searchQuality(fakeQ(900 * KB), 0.7, 0.92, LIM, false), null); // lossless: one try
  const fakeL = perPx => async L => ({ size: Math.round(L * L * perPx), L });
  r = await R.searchLongSide(fakeL(0.2), 1024, 3000, LIM);   // fits up to ~1581
  a.ok(r && r.size <= LIM && r.L > 1550 && r.L <= 1581, "got " + (r && r.L));
  a.equal(await R.searchLongSide(fakeL(1), 1024, 3000, LIM), null);         // nothing above 1024 fits
  console.log("rules: all pass");
})().catch(e => { console.error(e); process.exit(1); });
