var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var SelectService = require('./SelectService');
var SelectDevices = require('./SelectDevices');
var Device = require('./Device');
var AppStatus = require('./AppStatus');
var DisplayError = require('./DisplayError');
var url = require('url');

var MyApp = {
    getInitialState: function() {
        return this.props.ctx.store.getState();
    },
    componentDidMount: function() {
        if (!this.unsubscribe) {
            this.unsubscribe = this.props.ctx.store
                .subscribe(this._onChange.bind(this));
            this._onChange();
        }
    },
    componentWillUnmount: function() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    },
    _onChange : function() {
        if (this.unsubscribe) {
            this.setState(this.props.ctx.store.getState());
        }
    },

    doSwitch: function() {
        var parsedURL = url.parse(window.location.href);
        delete parsedURL.search; // no cache
        parsedURL.pathname = 'index-iot.html';
        window.open(url.format(parsedURL));
    },

    render: function() {
        return cE("div", {className: "container-fluid"},
                  cE(DisplayError, {
                      ctx: this.props.ctx,
                      error: this.state.error
                  }),
                  cE(rB.Panel, {
                      header: cE(rB.Grid, {fluid: true},
                                 cE(rB.Row, null,
                                    cE(rB.Col, {sm:1, xs:1},
                                       cE(AppStatus, {
                                           isClosed: this.state.isClosed
                                       })),
                                    cE(rB.Col, {
                                        sm: 5,
                                        xs:10,
                                        className: 'text-right'
                                    }, "IoT Browser Example"),
                                    cE(rB.Col, {
                                        sm: 5,
                                        xs:11,
                                        className: 'text-right'
                                    }, this.state.fullName)
                                   )
                                )
                  },
                     cE(rB.Panel, {header: "Select Service"},
                        cE(SelectService, {
                            ctx: this.props.ctx,
                            localIdentifiers: this.state.localIdentifiers
                        })),
                     cE(rB.Panel, {header: "Click to Connect Device"},
                        cE(SelectDevices, {
                            ctx: this.props.ctx,
                            devices: this.state.devices,
                            selectedDevice: this.state.selectedDevice
                        })),
                     (this.state.selectedDevice ?
                      cE(rB.Panel, {header: "Bluetooth Device"},
                         cE(Device, {
                             ctx: this.props.ctx,
                             selectedDevice: this.state.selectedDevice,
                             sensorValue: this.state.sensorValue
                         })) :
                      cE(rB.Panel, {header: "No Connected Devices"})
                     )
                    ),
                  cE(rB.Panel, {header: 'Run Device Hub in Browser'},
                        cE(rB.Button, {onClick: this.doSwitch,
                                       bsStyle : 'danger', key: 9876},
                           'Run')
                    )
                 );
    }
};

module.exports = React.createClass(MyApp);
