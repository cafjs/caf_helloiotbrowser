var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');
var objectAssign = require('object-assign');

var SelectService = {
    handleServiceId: function() {
        var all =  objectAssign({}, this.props.localIdentifiers, {
            serviceId: this.refs.serviceId.getValue()
        });
        AppActions.setLocalState(this.props.ctx, {localIdentifiers: all});
    },

    handleBlinkId: function() {
        var all =  objectAssign({}, this.props.localIdentifiers, {
            blinkId: this.refs.blinkId.getValue()
        });
        AppActions.setLocalState(this.props.ctx, {localIdentifiers: all});
    },

    handleNotifyId: function() {
        var all =  objectAssign({}, this.props.localIdentifiers, {
            notifyId: this.refs.notifyId.getValue()
        });
        AppActions.setLocalState(this.props.ctx, {localIdentifiers: all});
    },

    doRun: function() {
        var localIds = this.props.localIdentifiers || {};
        if (localIds.notifyId && localIds.blinkId && localIds.serviceId) {
            AppActions.findServices(this.props.ctx, localIds.serviceId,
                                    localIds.blinkId, localIds.notifyId);
        } else {
            AppActions.setError(this.props.ctx, new Error('Missing id'));
        }
    },

    launchEvent : function(ev) {
        if (ev.key === 'Enter') {
            this.doRun();
        }
    },

    render: function() {
        var localIds = this.props.localIdentifiers || {};
        return  cE(rB.Grid, {fluid: true},
                  cE(rB.Row, null,
                     cE(rB.Col, {sm:3, xs:12},
                        cE(rB.Input, {
                            type: 'text',
                            ref: 'serviceId',
                            value: localIds.serviceId,
                            onChange: this.handleServiceId,
                            placeholder: 'Service Id'
                        })
                       ),
                     cE(rB.Col, {sm:3, xs:12},
                        cE(rB.Input, {
                            type: 'text',
                            ref: 'blinkId',
                            value: localIds.blinkId,
                            onChange: this.handleBlinkId,
                            placeholder: 'Blink Id'
                        })
                       ),
                     cE(rB.Col, {sm:3, xs:12},
                        cE(rB.Input, {
                            type: 'text',
                            ref: 'notifyId',
                            value: localIds.notifyId,
                            onChange: this.handleNotifyId,
                            onKeyDown: this.launchEvent,
                            placeholder: 'Notify Id'
                        })
                       ),
                     cE(rB.Col, {sm:3, xs:12},
                        cE(rB.Button, {onClick: this.doRun}, 'Find'))
                    )
                  );
    }
};


module.exports = React.createClass(SelectService);
