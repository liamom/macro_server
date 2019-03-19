import React, { Component, PureComponent } from 'react';
import './style/popup.css'

interface ModalPopupState {
    visible: boolean
}

interface ModalPopupProps {
    visible: boolean
}

class ModalPopup extends Component<ModalPopupProps, ModalPopupState> {
    constructor(props: ModalPopupProps) {
        super(props);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
        this.state = {
            visible: props.visible
        }
    }

    componentWillReceiveProps(newProps: ModalPopupProps) {
        this.setState({
            visible: newProps.visible
        })
    }

    public hide() {
        this.setState({visible:false})
    }

    public show() {
        this.setState({visible:true})
    }

    render() {
        if (this.state.visible) {
            return (
                <div className="popup">
                    <div className="popup_inner">
                        <button className="close-button" onClick={this.hide}>close</button>
                        {this.props.children}
                    </div>
                </div>
            )
        }

        return null;
    }
}

export default ModalPopup;