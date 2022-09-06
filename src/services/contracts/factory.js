import { ethers } from "ethers"
import { ABI } from "../constants/abi"
import { ADDRESS } from "../constants/common"
import { METH } from "../constants/contracts";
import log from "../logging/logger";
import Wallet from "../wallet";

import CommonF from "./common";

const FactoryContract = {
    get contract() {
        // Wallet.init();
        return new ethers.Contract(
            ADDRESS.FACTORY_CONTRACT, 
            ABI.FactoryContract,
            Wallet.provider
        );
    },
    get iface() {
        return new ethers.utils.Interface(ABI.FactoryContract);
    },
    bytecode: function(meth, values) {
        return this.iface.encodeFunctionData(meth, values);
    },
    getPair: function(addr1, addr2) {
        return this.contract.getPair(addr1, addr2);
    }
}

export default FactoryContract;