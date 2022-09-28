import React, { Component } from 'react';
import { EntityComponent } from './Entity';
import './EntityContainer.css';

export default class EntityContainer extends Component {
    static displayName = EntityContainer.name;

    constructor(props) {
        super(props);
        this.state = {
            isOpened: false,
            openedEntity: -1,
            openedSubEntity: -1,
            lastEntity: -1,
            isChangeable: false
        };

        this.handleOnClick = this.handleOnClick.bind(this);
        this.handleOnEntityClick = this.handleOnEntityClick.bind(this);
        this.handleOnSubEntityClick = this.handleOnSubEntityClick.bind(this);
        this.handleOnEditClick = this.handleOnEditClick.bind(this);
        this.handleOnRemoveClick = this.handleOnRemoveClick.bind(this);
        this.handleOnSubRemoveClick = this.handleOnSubRemoveClick.bind(this);
        this.handleOnAddClick = this.handleOnAddClick.bind(this);
        this.handleOnHideClick = this.handleOnHideClick.bind(this);
        this.handleOnSaveClick = this.handleOnSaveClick.bind(this);
    }

    componentDidMount() {
        var entityContainer = document.getElementById("entities");
        var isOpened = this.state.isOpened;
        entityContainer.style.display = (isOpened) ? "block" : "none";
    }

    handleOnClick(e) {
        var entityContainer = document.getElementById("entities");
        var isOpened = this.state.isOpened;
        if (isOpened) {
            entityContainer.style.display = "none";
        } else {
            entityContainer.style.display = "block";
        }

        this.setState({ isOpened: !isOpened });
    }

    handleOnEntityClick(e, i) {
        var openedEntity = this.state.openedEntity;
        if (i == openedEntity) {
            openedEntity = -1;
        } else {
            openedEntity = i;
        }

        this.setState({ openedEntity: openedEntity, openedSubEntity: -1, isChangeable: false });
    }

    handleOnSubEntityClick(e, i) {
        var openedSubEntity = this.state.openedSubEntity;
        if (i == openedSubEntity) {
            openedSubEntity = -1;
        } else {
            openedSubEntity = i;
        }

        this.setState({ openedSubEntity: openedSubEntity, isChangeable: false });
    }

    handleOnHideClick() {
        var openedEntity = this.state.openedEntity;

        this.props.onHide(openedEntity);
    }

    handleOnEditClick(e) {
        var isChangeable = this.state.isChangeable;

        this.setState({ isChangeable: !isChangeable });
    }

    handleOnSaveClick(e) {
        var updatedEntity = document.getElementById("div" + this.state.openedEntity + "_" + this.state.openedSubEntity).children;
        var data = {};
        for (var i = 1; i < updatedEntity.length; i++) {
            var paramName = updatedEntity[i].children[0].textContent.replace(" : ", "");
            var children = updatedEntity[i].children[1].children;
            if (children.length > 2) {
                let dataArray = [];
                for (var j = 0; j < children.length; j++) {
                    dataArray.push(+children[j].children[1].value);
                }
                data[paramName] = dataArray;
                continue;
            }

            let val = children[0].children[0].value;
            if (val === 'false' || val === "true") {
                data[paramName] = children[0].children[0].checked;
            } else if (isNaN(+val)) {
                data[paramName] = val;
            } else {
                data[paramName] = +val;
            }
        }

        this.props.onEdit(this.state.openedEntity, this.state.openedSubEntity, data);
    }

    handleOnRemoveClick(e) {
        var openedEntity = this.state.openedEntity;
        this.handleOnEntityClick(e, openedEntity)

        this.props.onRemove(openedEntity, -1);
    }

    handleOnSubRemoveClick(e) {
        var openedEntity = this.state.openedEntity;
        var openedSubEntity = this.state.openedSubEntity;
        this.handleOnSubEntityClick(e, openedSubEntity)

        this.props.onRemove(openedEntity, openedSubEntity);
    }

    handleOnAddClick(e) {
        var id = this.props.onAdd();
        //this.setState({ openedEntity: id, isChangeable: true });
        //setTimeout(this.scrollDown, 0, id);
    }

    scrollDown(id) {
        var elemId = document.getElementById("div" + id);
        elemId.scrollIntoView(true);
    }

    render() {
        return (
            <div id="entityContainer" className="eContainer flexCC">
                <div onClick={this.handleOnClick} className="name clicked flexCC borderD8 backColor">
                    <p className="name"><b>Entities</b></p>
                </div>
                <div id="entities" className="entities flexCC">
                    {this.props.entities.map((v) => (
                        <EntityComponent key={"entity" + v.id} entities={v.entity} id={v.id} thickness={v.thickness}
                            onEntityClick={this.handleOnEntityClick} onSubEntityClick={this.handleOnSubEntityClick}
                            isOpened={v.id == this.state.openedEntity} isSubOpened={this.state.openedSubEntity} isChangeable={this.state.isChangeable}
                            save={this.handleOnSaveClick} edit={this.handleOnEditClick} hide={this.handleOnHideClick}
                            remove={this.handleOnRemoveClick} subRemove={this.handleOnSubRemoveClick} />))}
                </div>
                <div style={{ display: (this.state.isOpened) ? "initial" : "none" }} onClick={this.handleOnAddClick} className="name clicked flexCC borderD8 backColor">
                    <p className="name">Add new...</p>
                </div>
            </div>
        );
    }
}