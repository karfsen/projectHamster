import './tabstyle.css';
import React from 'react';

const Tab = props => {
    let tabstyle=props.styleName;
    if(tabstyle==="active" || tabstyle==="activeStat"){
        return (
            <div className={tabstyle}>
                <div className="Tab">{props.text}</div>
                <div className="Rectangle"></div>
            </div>
        );
    }
    else{
        return (
            <div className={tabstyle}>
                <div className="Tab">{props.text}</div>
            </div>
        );
    }
};

export default Tab;