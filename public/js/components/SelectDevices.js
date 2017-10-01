var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');

var SelectDevices = {

    indexToId: {},
    selectedDeviceIndex: null,

    handleSelect: function(selectedKey) {
        AppActions.selectDevice(this.props.ctx, this.indexToId[selectedKey]);
    },

    updateDevices: function() {
        var self = this;
        var result = [];
        var devices = Object.keys(this.props.devices || {}).sort();
        devices.forEach(function(x, i) {
            self.indexToId[i] = x;
            if (self.props.selectedDevice === x) {
                self.selectedDeviceIndex = i;
            }
            var adv = self.props.devices[x].advertisement;
            adv = {localName: adv.localName, serviceData: adv.serviceData};
            result.push(cE(rB.NavItem, {eventKey: i, key: 6723*i + 5},
                           x + '   advertisement: ' + JSON.stringify(adv)));
        });
        return result;
    },

    render: function() {
        var allNav = this.updateDevices();
        var props = { bsStyle: "pills", stacked: true,
                      onSelect: this.handleSelect};
        if (typeof this.selectedDeviceIndex === 'number') {
            props.activeKey = this.selectedDeviceIndex;
        }
        return  cE(rB.Nav, props, allNav);
    }
};


module.exports = React.createClass(SelectDevices);
