var AppConstants = require('../constants/AppConstants');
var json_rpc = require('caf_transport').json_rpc;
var caf_cli =  require('caf_cli');

var updateF = function(store, state) {
    var d = {
        type: AppConstants.APP_UPDATE,
        state: state
    };
    store.dispatch(d);
};

var errorF =  function(store, err) {
    var d = {
        type: AppConstants.APP_ERROR,
        error: err
    };
    store.dispatch(d);
};

var notifyF = function(store, message) {
    var getNotifData = function(msg) {
        return json_rpc.getMethodArgs(msg)[0];
    };

    var d = {
        type: AppConstants.APP_NOTIFICATION,
        state: getNotifData(message)
    };
    store.dispatch(d);
};

var wsStatusF =  function(store, isClosed) {
    var d = {
        type: AppConstants.WS_STATUS,
        isClosed: isClosed
    };
    store.dispatch(d);
};

var AppActions = {
    initServer: function(ctx, initialData) {
        updateF(ctx.store, initialData);
    },
    init: function(ctx, cb) {
        var tok =  caf_cli.extractTokenFromURL(window.location.href);
        ctx.session.hello(ctx.session.getCacheKey(), tok, function(err, data) {
            if (err) {
                errorF(ctx.store, err);
            } else {
                updateF(ctx.store, data);
            }
            cb(err, data);
        });
    },
    setLocalState: function(ctx, data) {
        updateF(ctx.store, data);
    },
    resetError: function(ctx) {
        errorF(ctx.store, null);
    },
    setError: function(ctx, err) {
        errorF(ctx.store, err);
    },
    message:  function(ctx, msg) {
        console.log('message:' + JSON.stringify(msg));
        // refresh state
        AppActions.getState(ctx);
    },
    closing:  function(ctx, err) {
        console.log('Closing:' + JSON.stringify(err));
        wsStatusF(ctx.store, true);
    }
};

['findServices', 'selectDevice', 'blink', 'getState', 'stop',
 'disconnect'].forEach(function(x) {
     AppActions[x] = async function() {
         var args = Array.prototype.slice.call(arguments);
         try {
             var ctx = args.shift();
             var data = await ctx.session[x].apply(ctx.session, args);
             updateF(ctx.store, data);
         } catch (err) {
             errorF(ctx.store, err);
         }
     };
 });

module.exports = AppActions;
