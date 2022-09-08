import log from "../logging/logger";
import l_t from "../logging/l_t";
import { contains, isDefined, notEmpty, notNull, rEqual } from "../utils"

const Err = {
    match: {
        PAIR_NOT_EXIST: 'pair not exist',
        PROCESS_WEB3: '',
        REJECTED_MM: 'user denied',
        REJECTED_WC: 'user rejected',
    },
    ErrText: {
        REJECTED: 'User rejected the transaction',
        PROCESS_WEB3: 'Kindly check your wallet',
        PAIR_NOT_EXIST: 'pool not exist for the pair!',
    },
    handle: function(e) {
        log.e('handling error:', e);
        let msg = '';
        log.e(e);
        if(rEqual(typeof e, 'object')) {
            if(isDefined(e.message)) {
                if(contains(e.message, this.match.PROCESS_WEB3)) 
                    msg = this.ErrText.PROCESS_WEB3;
                if(
                    contains(e.message, this.match.REJECTED_WC) || 
                    contains(e.message, this.match.REJECTED_MM)
                ) msg = this.ErrText.REJECTED;
                
            }
        } else if(rEqual(typeof e, 'string')) {
            if(contains(e, this.match.PAIR_NOT_EXIST))
                msg = this.ErrText.PAIR_NOT_EXIST;
            else msg = e;
        } else msg = 'error type unknown!';
        notEmpty(msg) && l_t.e(msg);
    }
}

const LocalStore = {
    clear: _ => localStorage.clear(),
    get: key  => localStorage.getItem(key),
    del: key  => localStorage.removeItem(key),
    has: key => notNull(localStorage.getItem(key)),
    add: (key, value)  => localStorage.setItem(key, value),
}

export {
    Err,
    LocalStore,
}