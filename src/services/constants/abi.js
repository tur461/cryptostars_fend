export const ABI = {
    get Token() {
        return require('../../Assets/abi/tokenContract.ABI.json');
    },
    get PairContract() {
        return require('../../Assets/abi/pair.ABI.json');
    },
    get CSTTokenContract() {
        return require('../../Assets/abi/CSTToken.json');
    },
    get CSTFaucetContract() {
        return require('../../Assets/abi/CSTFaucet.json');
    },
    get FactoryContract() {
        return require('../../Assets/abi/factory.ABI.json');
    },
    get RouterContract() {
        return require('../../Assets/abi/router.ABI.json');
    },
}