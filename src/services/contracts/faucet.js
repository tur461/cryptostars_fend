import { ethers } from "ethers"
import { ABI } from "../constants/abi"
import { ADDRESS } from "../constants/common"
import Wallet from "../wallet";

import CommonF from "./common";

const FaucetContract = {
    get contract() {
        // Wallet.init();
        return new ethers.Contract(
            ADDRESS.CST_FAUCET_CONTRACT, 
            ABI.CSTFaucetContract,
            Wallet.provider
        );
    },
    get iface() {
        return new ethers.utils.Interface(ABI.CSTFaucetContract);
    },
    bytecode: function(meth, values) {
        return this.iface.encodeFunctionData(meth, values);
    },
    hasClaimed: function(addr) {
        return this.contract.hasClaimed(addr);
    },
    claimCST: function() {
        let txObj = {
            from: CommonF.from, to: ADDRESS.CST_FAUCET_CONTRACT,
            data: this.bytecode('claim', [])
        }
        return CommonF.sendTx(txObj);
    },
}

export default FaucetContract;