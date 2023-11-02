const REDACTED =  require("./REDACTED.js");
const ListToken =  require("./ListToken.js");
const CashToken =  require("./CashToken.js");
const EosioToken =  require("./EosioToken.js");
const SwapREDACTED =  require("./SwapREDACTED.js").SwapREDACTED;
const eoslime =  require("./SwapREDACTED.js").eoslime;

const init = async () => {
  const listToken = new ListToken();
  await listToken.init()

  const cashToken = new CashToken()
  await cashToken.init()

  const REDACTED = new REDACTED();
  await REDACTED.init()

  const swapREDACTED = new SwapREDACTED();
  await swapREDACTED.init()

  const eosioToken = new EosioToken();
  await eosioToken.init()

  const tetherTether = new EosioToken();
  await tetherTether.init()

  const apk = await eoslime.Account.createRandom();
  const ins = await eoslime.Account.createRandom();
  const director = await eoslime.Account.createRandom();
  const alice = await eoslime.Account.createRandom();
  const userA = await eoslime.Account.createRandom();
  const userB = await eoslime.Account.createRandom();
  const userC = await eoslime.Account.createRandom();
  const userD = await eoslime.Account.createRandom();

  let feeREDACTED
  const feeREDACTEDPrivateKey = 'REDACTED'
  try {
    feeREDACTED = await eoslime.Account.create('fee.REDACTED', feeREDACTEDPrivateKey)
  } catch (e) {
    feeREDACTED = await eoslime.Account.load('fee.REDACTED', feeREDACTEDPrivateKey);
  }

  await listToken.setTrust({trust1: apk, trust2: ins})
  await listToken.setDirector({trust1: apk, trust2: ins, director})

  return { REDACTED, listToken, cashToken, swapREDACTED, eosioToken, tetherTether, alice, director, userA, apk, ins, userB, userC, userD, feeREDACTED }
}

module.exports = init;