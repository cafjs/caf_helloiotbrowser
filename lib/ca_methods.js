/*!
Copyright 2013 Hewlett-Packard Development Company, L.P.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

"use strict";
var assert = require('assert');
var caf = require('caf_core');
var app = require('../public/js/app.js');
var caf_comp = caf.caf_components;
var myUtils = caf_comp.myUtils;
var APP_SESSION = 'default';
var IOT_SESSION = 'iot';


var notifyIoT = function(self, msg) {
    var $$ = self.$.sharing.$;
    var notif = {msg: msg, fromCloud:  $$.fromCloud.dump()};
    self.$.session.notify([notif], IOT_SESSION);
};

var notifyWebApp = function(self, msg) {
    self.$.session.notify([msg], APP_SESSION);
};

var doBundle = function(self, command, arg) {
    var bundle = self.$.iot.newBundle();
    if (arg === undefined) {
        bundle[command](0);
    } else {
        bundle[command](0, [arg]);
    }
    self.$.iot.sendBundle(bundle);
    notifyIoT(self, command);
};

exports.methods = {

    // Called by the framework

    '__ca_init__' : function(cb) {
        this.state.sensorValue = null;
        this.state.devices = {};
        this.state.selectedDevice = null;
        this.state.iotMethodsMeta = this.$.iot.iotMethodsMeta();
        this.$.session.limitQueue(1, APP_SESSION); // only the last notification
        this.$.session.limitQueue(1, IOT_SESSION); // only the last notification
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        this.state.trace__iot_sync__ = 'traceSync';
        cb(null);
    },
    '__ca_resume__' : function(cp, cb) {
        // need to recreate, in case the IoT  device implementation changed.
        this.state.iotMethodsMeta = this.$.iot.iotMethodsMeta();
        cb(null);
    },
    '__ca_pulse__' : function(cb) {
        this.$._.$.log && this.$._.$.log.debug('calling PULSE!!!');
        this.$.react.render(app.main, [this.state]);
        cb(null, null);
    },

    // Called by the web app

    hello : function(key, tokenStr, cb) {
        this.$.react.setCacheKey(key);
        this.$.iot.registerToken(tokenStr);
        this.getState(cb);
    },

    findServices : function(serviceId, chIdBlink, chIdNotify, cb) {
        this.state.config = {service: serviceId, blink: chIdBlink,
                             notify: chIdNotify};
        doBundle(this, 'findServices', myUtils.deepClone(this.state.config));
        this.getState(cb);
    },

    selectDevice:  function(deviceId, cb) {
        this.state.selectedDevice = deviceId;
        doBundle(this, 'selectDevice', deviceId);
        this.getState(cb);
    },

    blink: function(cb) {
        doBundle(this, 'blink');
        this.getState(cb);
    },

    stop: function(cb) {
        doBundle(this, 'stop');
        this.getState(cb);
    },

    disconnect: function(cb) {
        doBundle(this, 'disconnect');
        this.state.selectedDevice = null;
        this.getState(cb);
    },

    'getState' : function(cb) {
        this.$.react.coin();
        cb(null, this.state);
    },


    // Called by the IoT device

    'traceSync' : function(cb) {
        var $$ = this.$.sharing.$;
        var now = (new Date()).getTime();
        this.$.log.debug(this.state.fullName + ':Syncing!!:' + now);
        this.state.sensorValue = $$.toCloud.get('sensorValue');
        this.state.devices = $$.toCloud.get('devices');
        notifyWebApp(this, 'New inputs');
        cb(null);
    }
};


caf.init(module);
