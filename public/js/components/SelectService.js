var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');
var url = require('url');

var SelectService = {
    handleServiceId: function() {
        var all =  Object.assign({}, this.props.config, {
            serviceId: this.refs.serviceId.getValue()
        });
        AppActions.setConfig(this.props.ctx, all);
    },

    handleBlinkId: function() {
        var all =  Object.assign({}, this.props.config, {
            blinkId: this.refs.blinkId.getValue()
        });
        AppActions.setConfig(this.props.ctx, all);
    },

    handleNotifyId: function() {
        var all =  Object.assign({}, this.props.config, {
            notifyId: this.refs.notifyId.getValue()
        });
        AppActions.setConfig(this.props.ctx, all);
    },

    doRun: function() {
        var localIds = this.props.config || {};
        if (localIds.notifyId && localIds.blinkId && localIds.serviceId) {
            AppActions.findServices(this.props.ctx, localIds.serviceId,
                                    localIds.blinkId, localIds.notifyId);
            return null;
        } else {
            const err = new Error('Missing id');
            AppActions.setError(this.props.ctx, err);
            return err;
        }
    },

    doRunSpawn: function() {
        const err = this.doRun();
        if (!err) {
            var parsedURL = url.parse(window.location.href);
            delete parsedURL.search; // no cache
            parsedURL.pathname = 'index-iot.html';
            window.open(url.format(parsedURL));
        }
    },

    render: function() {
        var localIds = this.props.config || {};
        return  cE(rB.Grid, {fluid: true},
                  cE(rB.Row, null,
                     cE(rB.Col, {sm:4, xs:12},
                        cE(rB.Input, {
                            type: 'text',
                            ref: 'serviceId',
                            label: 'Service',
                            value: localIds.serviceId,
                            onChange: this.handleServiceId,
                            placeholder: 'Service Id'
                        })
                       ),
                     cE(rB.Col, {sm:4, xs:12},
                        cE(rB.Input, {
                            type: 'text',
                            ref: 'blinkId',
                            label: 'Blink',
                            value: localIds.blinkId,
                            onChange: this.handleBlinkId,
                            placeholder: 'Blink Id'
                        })
                       ),
                     cE(rB.Col, {sm:4, xs:12},
                        cE(rB.Input, {
                            type: 'text',
                            ref: 'notifyId',
                            label: 'Notify',
                            value: localIds.notifyId,
                            onChange: this.handleNotifyId,
                            placeholder: 'Notify Id'
                        })
                       ),
                     cE(rB.Col, {sm:4, xs:6},
                        cE(rB.Button, {onClick: this.doRunSpawn,
                                       bsStyle : 'danger'},
                           'Spawn & Find')
                       ),
                     cE(rB.Col, {sm:4, xs:6},
                        cE(rB.Button, {onClick: this.doRun}, 'Find'))
                    )
                  );
    }
};


module.exports = React.createClass(SelectService);
