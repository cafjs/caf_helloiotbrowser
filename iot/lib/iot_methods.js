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

var myUtils = require('caf_iot').caf_components.myUtils;

exports.methods = {
    async __iot_setup__() {
        this.state.index = 0;
        this.scratch.devices = {};
        this.state.deviceInfo = {};
        this.state.sensorValue = null;
        return [];
    },

    async __iot_loop__() {
        this.$.log && this.$.log.debug('Time offset ' +
                                       (this.$.cloud.cli &&
                                        this.$.cloud.cli
                                        .getEstimatedTimeOffset()));
        this.state.index = this.state.index + 1;
        var now = (new Date()).getTime();
        this.$.log && this.$.log.debug(now + ' loop:' + this.state.index);

        if (!myUtils.deepEqual(this.toCloud.get('devices'),
                               this.state.deviceInfo)) {
            this.toCloud.set('devices', this.state.deviceInfo);
        }
        if (this.toCloud.get('sensorValue') !== this.state.sensorValue) {
            this.toCloud.set('sensorValue', this.state.sensorValue);
        }

        return [];
    },

    findServices(config, cb) {
        var self = this;
        var now = (new Date()).getTime();
        this.$.log && this.$.log.debug(now + ' config:' +
                                       JSON.stringify(config));
        this.state.config = config;
        if (typeof window !== 'undefined') {
            /* A button with id 'confirmScan' by convention that is only
             visible when input is needed to bypass Web BT security check.
             For example:
             <button id="confirmScan" style= "display:none;">
                      Click to allow Bluetooth scan</button>
             */

            var button = document.getElementById('confirmScan');
            button.style = 'display:inline;';
            button.addEventListener('click', function handler() {

                self.$.gatt.findServices(config.service,
                                         '__iot_foundService__');
                this.removeEventListener('click', handler);
                button.style = 'display:none;';
                cb(null);
            });
        } else {
            this.$.gatt.findServices(config.service, '__iot_foundService__');
            cb(null);
        }

    },

    async __iot_foundService__(serviceId, device) {
        var self = this;
        var filterF = function() {
            var all = self.scratch.devices || {};
            var result = {};
            Object.keys(all).forEach(function(x) {
                result[x] = {
                    uuid: all[x].uuid,
                    advertisement: myUtils.deepClone(all[x].advertisement)
                };
            });
            return result;
        };

        if (serviceId === this.state.config.service) {
            this.scratch.devices[device.uuid] = device;
            this.state.deviceInfo = filterF();
        } else {
            this.$.log && this.$.log.debug('Ignoring device with serviceID: ' +
                                           serviceId + ' as opposed to ' +
                                           this.state.config.service);
        }
        return [];
    },

    async selectDevice(deviceId) {
        this.$.log && this.$.log.debug('Selected device ' + deviceId);
        this.state.selectedDevice = deviceId;
        if (this.scratch.devices[deviceId]) {
            this.$.gatt.findCharacteristics(this.state.config.service,
                                            this.scratch.devices[deviceId],
                                            '__iot_foundCharact__');
        } else {
            this.$.log && this.$.log.debug('select: Ignoring unknown device ' +
                                           deviceId);
        }
        return [];
    },

    async __iot_foundCharact__(service, device, chArray) {
        var compare = function(x, y) {
            if (x.length < y.length) {
                return compare(y, x);
            } else {
                return ((x === y) ||
                        (x === '0000' + y + '00001000800000805f9b34fb'));
            }
        };
        var self = this;
        chArray = chArray || [];
        this.$.log && this.$.log.debug('Found characteristics ' +
                                       chArray);
        chArray.forEach(function(x) {
            if (compare(x.uuid, self.state.config.blink)) {
                self.scratch.blinkCharact = x;
            } else if (compare(x.uuid, self.state.config.notify)) {
                self.scratch.notifyCharact = x;
                self.$.gatt.subscribe(x, '__iot_subscribe__');
            } else {
                self.$.log && self.$.log.debug('Ignoring characteristic ' +
                                               x.uuid);
            }
        });
        return [];
    },

    async __iot_subscribe__(charact, value) {
        value = parseInt(value.toString('hex'), 16);
        this.$.log && this.$.log.debug('Notify: got ' + value);
        this.state.sensorValue = value;
        return [];
    },

    async blink() {
        var buf = new Buffer('on');
        if (this.scratch.blinkCharact) {
            this.$.log && this.$.log.debug('Blinking');
            this.$.gatt.write(this.scratch.blinkCharact, buf);
        }
        return [];
    },

    async stop() {
        var buf = new Buffer('off');
        if (this.scratch.blinkCharact) {
            this.$.log && this.$.log.debug('Stop advertising');
            this.$.gatt.write(this.scratch.blinkCharact, buf);
        }
        return [];
    },

    async disconnect() {
        if (this.scratch.notifyCharact) {
            this.$.gatt.unsubscribe(this.scratch.notifyCharact);
        }
        var device = this.state.selectedDevice &&
                this.scratch.devices[this.state.selectedDevice];
        if (device) {
            this.$.gatt.disconnect(device);
        }
        return [];
    }
};
