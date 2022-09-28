import React from 'react';


export const EntityComponent = (props) => {
    const {
        entities,
        isChangeable,
        id,
        isOpened,
        isSubOpened,
        onEntityClick,
        onSubEntityClick,
        edit,
        save,
        hide,
        remove,
        subRemove
    } = props;

    return (
        <div key={"div" + id} className="entities borderEnt backColor">
            <div key={"clickable" + id} className="clicked" onClick={(e, i = id) => onEntityClick(e, i)}><p key={"pClickable" + id} style={{ userSelect: "none" }}><b>ENTITY:</b>{"  id" + id}</p></div>
            <div key={"mainButtons" + id} style={{ display: "flex", flexDirection: "row", display: (isOpened ? "block" : "none") }}>
                <button key={"button01" + id} className="btn-entity btn-secondary" onClick={hide}>Hide</button>
                <button key={"button0" + id} className="btn-entity btn-danger" onClick={remove}>Remove</button>
            </div>
            {(isOpened) ?
                entities.map((v, i) => (
                    <div key={"entity" + id + "_" + i} className="subEntities borderEnt">
                        <div key={"clickable" + id + "_" + i} className="clicked" onClick={(e, id = i) => onSubEntityClick(e, id)}>
                            <p key={"pClickable" + id + "_" + i} style={{ userSelect: "none" }}><b>SUB_ENTITY:</b>{"  id" + i}</p></div>
                        {(i === isSubOpened) ?
                            <div key={"openedEntity" + id + "_" + i} className="entities" id={"div" + id + "_" + i}>
                                <div key={"buttons" + id} style={{ display: "flex", flexDirection: "row", display: (isOpened ? "block" : "none") }}>
                                    <button key={"button1" + id} className="btn-entity btn-primary" onClick={edit}>Edit</button>
                                    <button style={{ display: (isChangeable) ? "initial" : "none" }} key={"button2" + id} className="btn-entity btn-success" onClick={save}>Save</button>
                                    <button key={"button3" + id} className="btn-entity btn-danger" onClick={subRemove}>Remove</button>
                                </div>
                                {AddInfo(Object.entries(v), isChangeable, id + "_" + i)}
                            </div>
                            : ""}
                    </div>)
                )
                : ""}
        </div>
    );
}

function AddInfo(item, isChangeable, id, isEntry = false) {
    return Array.from(item, x => AddInfoLine(x, isChangeable, id, isEntry));
}

function AddInfoLine(num, isChangeable, id, isEntry) {
    let info = (Array.isArray(num[1])) ? AddInfo(Object.entries(num[1]), isChangeable, id, true) : (num[1] === Object(num[1])) ? AddInfo(Object.entries(num[1]), isChangeable, id, true) : GetInputType(num[0], num[1], isChangeable, id, isEntry);

    if (isEntry) {
        return info;
    }
    if (num[0] == "dCenter" || num[0] == "dRotation") {
        return;
    }
    return (<div className="param " key={num[0] + id}><b>{(!isNaN(num[0])) ? "" : `${num[0]} : `}</b><div key={num[0] + "Item" + id} style={{ display: "flex", flexDirection: "row" }}>{info}</div></div>)
}

var dopId = 0;

function GetInputType(param, value, isChangeable, id, isEntry) {
    if (!isChangeable) {
        if (isEntry) {
            return (<p key={"p" + id + dopId++} style={{ paddingLeft: "10px" }}><b>{(!isNaN(param)) ? "" : `${param} : `}</b>{"" + getSmallFloat(value)}</p>);
        }
        return (<p key={"p" + id + dopId++} style={{ paddingLeft: "10px" }}>{"" + getSmallFloat(value)}</p>);
    }

    if (typeof value !== 'boolean') {
        if (isEntry) {
            return (<p key={"p" + id + dopId++} style={{ paddingLeft: "10px" }}><b>{(!isNaN(param)) ? "" : `${param} : `}</b><input type="text" defaultValue={getSmallFloat(value)} className="entity" /></p>);
        }
        return (<p key={"p" + id + dopId++} style={{ paddingLeft: "10px" }}><input type="text" defaultValue={getSmallFloat(value)} className="entity" /></p>);
    }

    if (isEntry) {
        return (<p key={"p" + id + dopId++} style={{ paddingLeft: "10px" }}><b>{(!isNaN(param)) ? "" : `${param} : `}</b><input type="checkbox" defaultValue={value} defaultChecked={value} className="entity" /></p>);
    }
    return (<p key={"p" + id + dopId++} style={{ paddingLeft: "10px" }}><input type="checkbox" defaultValue={value} defaultChecked={value} className="entity" /></p>);
}

function getSmallFloat(value) {
    if (Math.abs(parseFloat(value)) >= 0) {
        return Math.round(value * 1000) / 1000.0;
    }
    return value;
}
