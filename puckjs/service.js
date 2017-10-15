var on = false;
var id =  null;
var counter = 0;
var lastMsg = null;

var stopBlinking = function() {
    if (id) {
        clearInterval(id);
        on = false;
        LED1.write(on);
        id = null;
    }
};

var startBlinking = function() {
    if (!id) {
        id = setInterval(function() {
            on = !on;
            LED1.write(on);
        }, 500);
    }
};

var serviceA = function(data) {
    data = String.fromCharCode.apply(null, data);
    lastMsg = data;
    if (data === 'on') {
        stopBlinking();
        startBlinking();
        setTimeout(function() {
            stopBlinking();
        }, 5000);
    } else {
        console.log('Ooops: wrong command ' + data);
    }
};



NRF.setServices({
    0xBCDE : {
        0xABCD : {
            value : "off",
            writable : true,
            readable: true,
            onWrite : function(evt) {
                serviceA(evt.data);
            }
        },
        0xAAAA : {
            value : [0],
            readable: true,
            notify: true
        }
    }
},{advertise: ["BCDE"]});


setInterval(function() {
    counter = (counter + 1) % 256;
    NRF.updateServices({
        0xBCDE : {
            0xAAAA : {
                value : [ counter],
                readable: true,
                notify: true
            }
        }
    });
    NRF.setAdvertising({
        0xBCDE: [counter]
    }, {interval:500, name: 'White'});
}, 2000);
