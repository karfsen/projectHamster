//knižnice
import React from 'react';
import ReactDOM from 'react-dom';
import Tab from './TabComponent';
import Logo from './logo';
import DataBox from './DataBox';
import "./DataBox.css";



//komponenty

class Main extends React.Component{
    render(){
        return(
            <div className="Align">
                <Navigation />
                <Data />
            </div>
        );
    };
}


const Navigation=()=>{
    return (
        <div className="Wrapper">
            <Tab text="Home" styleName="active" />
            <Tab text="Goals" styleName="inactive" />
            <Tab text="Statistics" styleName="inactiveStat"/>
            <Logo />           
        </div>
    );
};

const Data=()=>{
    return(
        <div className="Wrapper">
            <DataBox css="WhiteBox"/>
            <DataBox css="WhiteBox2"/>
            <DataBox css="TempoBox"/>
            <DataBox css="DistanceBox"/>
            <DataBox css="CreatedBy"/>
        </div>
    );
};

//vykreslovanie komponentov

ReactDOM.render(
    <Main />,
    document.querySelector('#root')
);