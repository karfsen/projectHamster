import React from 'react';
import './DataBox.css';

const Box= props =>{
    let css=props.css;
    if(css==="CreatedBy"){
        return(
            <div className={css}>
                <div className="CreatedByMe">web by Martin Krendželák, 2019</div>
            </div>
        )
    }
    else{
        return(
            <div className={css}>

            </div>
        );
    }
};

export default Box;