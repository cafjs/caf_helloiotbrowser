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

const myUtils = require('caf_iot').caf_components.myUtils;

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
        const now = (new Date()).getTime();
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

    async findServices(config) {
        const now = (new Date()).getTime();
        this.$.log && this.$.log.debug(now + ' config:' +
                                       JSON.stringify(config));
        this.state.config = config;
        if (typeof window !== 'undefined') {
            // Wait for user click
            await this.$.gatt.findServicesWeb(
                config.service, '__iot_foundService__', 'confirmScan',
                'afterConfirmScan'
            );
        } else {
            this.$.gatt.findServices(config.service, '__iot_foundService__');
        }
        return [];
    },

    async __iot_foundService__(serviceId, device) {
        const filterF = () => {
            const all = this.scratch.devices || {};
            const result = {};
            Object.keys(all).forEach((x) => {
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
            const processCharact = (service, device, chArray) => {
                const compare =  this.$.gatt.compareId;
                chArray = chArray || [];
                this.$.log && this.$.log.debug('Found characteristics ' +
                                               chArray);
                this.$.log && this.$.log.debug(
                    'Target characteristics blink:' + this.state.config.blink +
                    ' notify:' + this.state.config.notify
                );
                chArray.forEach((x) => {
                    if (compare(x.uuid, this.state.config.blink)) {
                        this.scratch.blinkCharact = x;
                    } else if (compare(x.uuid, this.state.config.notify)) {
                        this.scratch.notifyCharact = x;
                        this.$.gatt.subscribe(x, '__iot_subscribe__');
                    } else {
                        this.$.log && this.$.log.debug('Ignoring charact ' +
                                                       x.uuid);
                    }
                });
            };

            try {
                const {service, device, characteristics} =
                          await this.$.gatt.findCharacteristics(
                              this.state.config.service,
                              this.scratch.devices[deviceId]
                          );
                processCharact(service, device, characteristics);
                return [];
            } catch (err) {
                return [err];
            }
        } else {
            this.$.log && this.$.log.debug('select: Ignoring unknown device ' +
                                           deviceId);
            return [];
        }
    },

    async __iot_subscribe__(charact, value) {
        value = parseInt(value.toString('hex'), 16);
        this.$.log && this.$.log.debug('Notify: got ' + value);
        this.state.sensorValue = value;
        return [];
    },

    async blink() {
        if (this.scratch.blinkCharact) {
            const buf = new Buffer('on');
            this.$.log && this.$.log.debug('Blinking');
            await this.$.gatt.write(this.scratch.blinkCharact, buf);
        }
        return [];
    },

    async stop() {
        if (this.scratch.blinkCharact) {
            const buf = new Buffer('off');
            this.$.log && this.$.log.debug('Stop advertising');
            await this.$.gatt.write(this.scratch.blinkCharact, buf);
        }
        return [];
    },

    async disconnect() {
        if (this.scratch.notifyCharact) {
            this.$.gatt.unsubscribe(this.scratch.notifyCharact);
        }
        const device = this.state.selectedDevice &&
                this.scratch.devices[this.state.selectedDevice];
        if (device) {
            await this.$.gatt.disconnect(device);
        }
        return [];
    }
};
