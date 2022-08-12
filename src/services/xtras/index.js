import log from "../logging/logger";
import l_t from "../logging/l_t";
import { contains, isDefined, notEmpty, rEqual } from "../utils"

const Err = {
    match: {
        web3: {
            PROCESS_WEB3: '',
        }
    },
    ErrText: {
        PROCESS_WEB3: 'Please check metamask'
    },
    handle: function(e) {
        let msg = '';
        log.e(e);
        if(rEqual(typeof e, 'object')) {
            if(isDefined(e.message)) {
                if(contains(e.message, this.match.web3.PROCESS_WEB3)) 
                    msg = this.ErrText.PROCESS_WEB3;
                
            }
        } else msg = e;
        notEmpty(msg) && l_t.e(msg);
    }
}

export {
    Err,
}