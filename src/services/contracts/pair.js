import { ethers } from "ethers"
import { ABI } from "../constants/abi"
import { ADDRESS } from "../constants/common"
import { METH } from "../constants/contracts";
import log from "../logging/logger";
import Wallet from "../wallet";
import CommonF from "./common";

const PairContract = {
    _address: null,
    get contract() {
        // Wallet.init();
        return new ethers.Contract(
            this._address, 
            ABI.PairContract,
            Wallet.provider
        );
    },
    get iface() {
        return new ethers.utils.Interface(ABI.Token);
    },
    init: function(addr) {
        this._address = addr;
        return this;
    },
    bytecode: function(meth, values) {
        return this.iface.encodeFunctionData(meth, values);
    },
    getToken0: function() {
        return this.contract[METH.PAIR_CONTRACT.T0]();
    },
    getToken1: function() {
        return this.contract[METH.PAIR_CONTRACT.T1]();
    },
    getReserves: function() {
        return this.contract[METH.PAIR_CONTRACT.RESERVES]();
    }
}

export default PairContract;