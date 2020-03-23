var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');

var Device = {

    doBlink: function() {
        AppActions.blink(this.props.ctx);
    },

    doStop: function() {
        AppActions.stop(this.props.ctx);
    },

    render: function() {
        return  cE(rB.Grid, {fluid: true},
                   cE(rB.Row, null,
                      cE(rB.Col, {sm:6, xs:12},
                         cE(rB.Input, {
                             label: 'Device Id',
                             type: 'text',
                             ref: 'deviceId',
                             readOnly: true,
                             value: this.props.selectedDevice,
                             placeholder: 'No device'
                         })
                        ),
                      cE(rB.Col, {sm:6, xs:12},
                         cE(rB.Input, {
                             label: 'Sensor Value',
                             type: 'text',
                             ref: 'sensorValue',
                             readOnly: true,
                             value: this.props.sensorValue,
                             placeholder: 'No data'
                         })
                        )
                     ),
                   cE(rB.Row, null,
                      cE(rB.Col, {sm:6, xs:6},
                         cE(rB.Button, {
                             className: 'lowerInRow',
                             bsStyle: 'primary',
                             onClick: this.doBlink
                         }, "Start Blink")
                        ),
                      cE(rB.Col, {sm:6, xs:6},
                         cE(rB.Button, {
                             className: 'lowerInRow',
                             bsStyle: 'danger',
                             onClick: this.doStop
                         }, "Stop")
                        ),
                     )
                  );
    }
};

module.exports = React.createClass(Device);
