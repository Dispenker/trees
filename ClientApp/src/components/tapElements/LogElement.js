import React, { Component } from 'react';
import './LogElement.css';

export default class LogElement extends Component {
    static displayName = LogElement.name;

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <div id="logElement" className="log">
                
            </div>
        );
    }
}