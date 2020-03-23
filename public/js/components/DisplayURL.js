var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;
var AppActions = require('../actions/AppActions');

var DisplayURL = {

    doDismissURL: function(ev) {
        AppActions.setLocalState(this.props.ctx, {newURL: null});
    },

    doCopyURL: function(ev) {
        if (this.props.newURL) {
            navigator.clipboard.writeText(this.props.newURL)
                .then(() => {
                    console.log('Text copied OK to clipboard');
                })
                .catch(err => {
                    console.error('Could not copy text: ', err);
                });
/*
            const el = document.createElement('textarea');
            el.value = this.props.newURL;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
*/
        }
        this.doDismissURL();
    },
    render: function() {
        return cE(rB.Modal,{show: (this.props.newURL ? true : false),
                            onHide: this.doDismissURL,
                            animation: false},
                  cE(rB.Modal.Header, {
                      className : "bg-warning text-warning",
                      closeButton: true},
                     cE(rB.Modal.Title, null, "URL")
                    ),
                  cE(rB.ModalBody, null,
                     cE('p', null, 'Message:'),
                     cE(rB.Alert, {bsStyle: 'primitive'},
                        this.props.newURL)
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doCopyURL},
                        "Copy to Clipboard")
                    )
                 );
    }
};

module.exports = React.createClass(DisplayURL);
