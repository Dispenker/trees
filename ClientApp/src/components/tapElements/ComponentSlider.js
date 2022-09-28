import React, { Component } from 'react';
import './ComponentSlider.css';

export default class ComponentSlider extends Component {
    static displayName = ComponentSlider.name;

    constructor(props) {
        super(props);
        this.state = {
            current: 2,
            size: 0,
            step: 1,
            isPressed: 0
        };

        this.onChange = this.onChange.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    componentDidMount() {
        this.setState({
            current: this.props.current,
            size: this.props.value,
            step: this.props.step || 1
        });
    }

    onChange(e) {
        let inputElem = document.getElementById(this.props.id + "Input");
        let value = inputElem.value;

        this.setState({
            current: value,
            size: this.props.changeFunction(value)
        });
    }

    handleMouseDown(e, i) {
        let inputElem = document.getElementById(this.props.id + "Input");

        if (i > 0) {
            inputElem.stepUp();
        } else {
            inputElem.stepDown();
        }

        let value = inputElem.value;

        if (this.state.isPressed === null) {
            this.setState({
                current: value,
                size: this.props.changeFunction(value),
                isPressed: setInterval(this.handleMouseDown, 100, e, i)
            });
        } else {
            this.setState({
                current: value,
                size: this.props.changeFunction(value)
            });
        }

        
    }

    handleMouseUp(e) {
        clearInterval(this.state.isPressed);
        this.setState({ isPressed: null });
    }

    render() {
        return (
            <div id={this.props.id} className='dip backColor'>
                <p className='text'><b>{this.props.displayText}</b></p>
                <p className='text'> {this.props.stringFormat(this.state.size)} </p>
                <div className='buttons'>
                    <button className='butDip left' onMouseDown={(e, i = -1) => this.handleMouseDown(e, i)} onMouseUp={this.handleMouseUp}>⇜</button>
                    <input id={this.props.id + "Input"} type="range" min={(this.props.min === null) ? "0" : this.props.min} value={this.state.current} max={this.props.max} step={this.state.step} onChange={this.onChange} />
                    <button className='butDip right' onMouseDown={(e, i = 1) => this.handleMouseDown(e, i)} onMouseUp={this.handleMouseUp}>⇝</button>
                </div >
            </div>
        );
    }
}
