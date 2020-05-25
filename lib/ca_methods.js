// Modifications copyright 2020 Caf.js Labs and contributors
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

'use strict';
const caf = require('caf_core');
const app = require('../public/js/app.js');
const caf_comp = caf.caf_components;
const myUtils = caf_comp.myUtils;
const APP_SESSION = 'default';
const USER_SESSION = 'user';
const IOT_SESSION = 'iot';

const notifyIoT = function(self, msg) {
    const $$ = self.$.sharing.$;
    const notif = {msg: msg, fromCloud: $$.fromCloud.dump()};
    self.$.session.notify([notif], IOT_SESSION);
};

const notifyWebApp = function(self, msg) {
    self.$.session.notify([msg], APP_SESSION);
    self.$.session.notify([msg], USER_SESSION);
};

const doBundle = function(self, command, arg) {
    const bundle = self.$.iot.newBundle();
    if (arg === undefined) {
        bundle[command](0);
    } else {
        bundle[command](0, [arg]);
    }
    self.$.iot.sendBundle(bundle, self.$.iot.NOW_SAFE);
    notifyIoT(self, command);
};

exports.methods = {

    // Called by the framework

    async __ca_init__() {
        this.state.sensorValue = null;
        this.state.devices = {};
        this.state.config = {};
        this.state.selectedDevice = null;
        this.state.iotMethodsMeta = this.$.iot.iotMethodsMeta();
        this.$.session.limitQueue(1, APP_SESSION); // only the last notification
        this.$.session.limitQueue(1, USER_SESSION); // ditto
        this.$.session.limitQueue(1, IOT_SESSION); // ditto
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        this.state.trace__iot_sync__ = 'traceSync';
        return [];
    },
    async __ca_resume__(cp) {
        // need to recreate, in case the IoT  device implementation changed.
        this.state.iotMethodsMeta = this.$.iot.iotMethodsMeta();
        return [];
    },
    async __ca_pulse__() {
        this.$.log && this.$.log.debug('calling PULSE!!!');
        this.$.react.render(app.main, [this.state]);
        return [];
    },

    // Called by the web app

    async hello(key, tokenStr) {
        this.$.react.setCacheKey(key);
        this.$.iot.registerToken(tokenStr);
        return this.getState();
    },

    async setConfig(config) {
        this.state.config = Object.assign({}, this.state.config, config);
        return this.getState();
    },

    async findServices(serviceId, chIdBlink, chIdNotify) {
        const options = {
            service: serviceId, blink: chIdBlink, notify: chIdNotify
        };
        doBundle(this, 'findServices', options);
        return this.getState();
    },

    async selectDevice(deviceId) {
        this.state.selectedDevice = deviceId;
        doBundle(this, 'selectDevice', deviceId);
        return this.getState();
    },

    async blink() {
        doBundle(this, 'blink');
        return this.getState();
    },

    async stop() {
        doBundle(this, 'stop');
        return this.getState();
    },

    async disconnect() {
        doBundle(this, 'disconnect');
        this.state.selectedDevice = null;
        return this.getState();
    },

    async getState() {
        this.$.react.coin();
        return [null, this.state];
    },


    // Called by the IoT device

    async traceSync() {
        const $$ = this.$.sharing.$;
        const now = (new Date()).getTime();
        this.$.log.debug(this.state.fullName + ':Syncing!!:' + now);
        this.state.sensorValue = $$.toCloud.get('sensorValue');
        this.state.devices = $$.toCloud.get('devices');
        notifyWebApp(this, 'New inputs');
        return [];
    }
};


caf.init(module);
