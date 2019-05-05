import './tabstyle.css';
import React from 'react';

const Tab = props => {
    console.log(props);
    let tabstyle=props.styleName;
    console.log(tabstyle);
    if(tabstyle==="active"){
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