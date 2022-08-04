import log from "../logging/logger";
import l_t from "../logging/l_t";
import Wallet from "../wallet"

const CommonF = {
    from: '',
    init: function(p) {
        this.from = p.from;
    },
    sendTx: async function(txObj) {
        Wallet.init();
        try {
            let estimate = await Wallet.provider.estimateGas(txObj);
            txObj['gas'] = estimate.toHexString();
        } catch(e) {
            return new Promise((_, j) => j(l_t.e(e.reason)));
        }
        let txHash = await Wallet.provider.send('eth_sendTransaction', [txObj]);
        return Wallet.provider.waitForTransaction(txHash);
    },
}

export default CommonF;