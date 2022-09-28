import React, { Component } from 'react';
import { fsSource, vsSource, initShaderProgram } from './shaders';
import { computeMatrix, scaling } from './utils/m4_needed'
import ComponentSlider from './tapElements/ComponentSlider';
import EntityContainer from './tapElements/EntityContainer';
import { ToStringScaleFormat, ToStringCountFormat } from './tapElements/StringFormats';
import LogElement from './tapElements/LogElement';
import { draw, drawAxes, drawEntity, calculateEntity } from './utils/DrawUtils'
import { initBuffers, initWebGL, setCamera, setSettings } from './utils/CanvasUtils'
import './Canvas.css';

export class Home extends Component {
    static displayName = Home.name;

    constructor(props) {
        super(props);
        this.state = {
            gl: null,
            buffer: null,
            programInfo: null,
            camera: {
                rotate: [Math.PI * 2, Math.PI * 2, Math.PI * 2],
                position: [0, -0.3, 0],
                resolution: calculateResolution(35) * 0.02,
            },
            isPressed: false,
            clickPosition: [0, 0],
            lastClickedTime: 0,
            isNeedUpdate: false,
            pressedKeys: 0,
            pressTimeout: null,
            entity: {
                countAngles: 5,
                angle: 0,
                thickness: 0.15,
                lines: 10,
                parts: 5
            },
            entityLastId: 2,
            entities: [
                {
                    id: 0,
                    entity: [
                        {
                            center: [-1, 0.25, 1],
                            radius: 0.5,
                            rotation: [0, 0, 0],
                            countAngles: 5,
                            isFilled: false,
                            color: [0.6, 0.2, 0.3, 0.8],
                            isContured: false,
                            sideColor: [0.2, 0.3, 0.4, 0.8],
                            isSideContured: true
                        },
                        {
                            center: [0, 0.25, 0],
                            radius: 0.5,
                            rotation: [0, 0, 0],
                            countAngles: "circle",
                            isFilled: false,
                            color: [0.6, 0.2, 0.3, 0.8],
                            isContured: false,
                            sideColor: [0.2, 0.3, 0.4, 0.8],
                            isSideContured: true,
                            thicknessType: "triangle"
                        }
                    ],
                    isHiden: false,
                    thickness: 0.025
                },
                {
                    id: 1,
                    entity: [
                        {
                            center: [0, 0.25, 0],
                            radius: 0.5,
                            rotation: [0, 0, 0],
                            countAngles: 5,
                            isFilled: false,
                            color: [0.6, 0.2, 0.3, 0.8],
                            isContured: false,
                            sideColor: [0.2, 0.3, 0.4, 0.8],
                            isSideContured: true
                        },
                        {
                            center: [0, 0.25, 0],
                            radius: 0.5,
                            rotation: [0, 0, 0],
                            countAngles: "circle",
                            isFilled: false,
                            color: [0.6, 0.2, 0.3, 0.8],
                            isContured: false,
                            sideColor: [0.2, 0.3, 0.4, 0.8],
                            isSideContured: true,
                            thicknessType: "line"
                        }
                    ],
                    isHiden: false,
                    thickness: 0.025
                },
                {
                    id: 2,
                    entity: [
                        {
                            center: [1, 0.25, -1],
                            radius: 0.5,
                            rotation: [0, 0, 0],
                            countAngles: 5,
                            isFilled: false,
                            color: [0.6, 0.2, 0.3, 0.8],
                            isContured: false,
                            sideColor: [0.2, 0.3, 0.4, 0.8],
                            isSideContured: true
                        },
                        {
                            center: [0, 0.25, 0],
                            radius: 0.5,
                            rotation: [0, 0, 0],
                            countAngles: "circle",
                            isFilled: false,
                            color: [0.6, 0.2, 0.3, 0.8],
                            isContured: false,
                            sideColor: [0.2, 0.3, 0.4, 0.8],
                            isSideContured: false,
                            thicknessType: ""
                        }
                    ],
                    isHiden: false,
                    thickness: 0.025
                }
            ]
        };

        this.loadCanvas = this.loadCanvas.bind(this);
        this.hundleMouseDown = this.hundleMouseDown.bind(this);
        this.hundleMouseUp = this.hundleMouseUp.bind(this);
        this.hundleMouseMove = this.hundleMouseMove.bind(this);
        this.hundleKeyPress = this.hundleKeyPress.bind(this);
        this.hundleKeyDown = this.hundleKeyDown.bind(this);
        this.hundleKeyUp = this.hundleKeyUp.bind(this);
        this.changeValue = this.changeValue.bind(this);
        this.changeCountAngles = this.changeCountAngles.bind(this);
        this.changeAngle = this.changeAngle.bind(this);
        this.removeEntity = this.removeEntity.bind(this);
        this.editEntity = this.editEntity.bind(this);
        this.addEntity = this.addEntity.bind(this);
        this.hideEntity = this.hideEntity.bind(this);
        this.loadEntity = this.loadEntity.bind(this);
        this.drawScene = this.drawScene.bind(this);
        this.onSendind = this.onSendind.bind(this);
        this.changeThickness = this.changeThickness.bind(this);
        this.changeLines = this.changeLines.bind(this);
        this.changeParts = this.changeParts.bind(this);
    }

    componentDidMount() {
        this.loadCanvas();
    }

    hundleMouseDown(e) {
        var X = e.clientX;
        var Y = e.clientY;
        this.setState({ isPressed: true, clickPosition: [X, Y] });
    }

    hundleMouseUp(e) {
        this.setState({ isPressed: false });
    }

    hundleMouseMove(e) {
        if (!this.state.isPressed)
            return;

        if ((new Date().getTime() - this.state.lastClickedTime) < 15)
            return;

        var X = e.clientX;
        var Y = e.clientY;

        var camera = this.state.camera;
        var diapazoneX = function (angle) {
            return angle;//Math.max(Math.min(angle, Math.PI * 9 / 4), Math.PI * 5 / 4);
        }
        var diapazoneY = function (angle) {
            return angle;//Math.max(Math.min(angle, Math.PI * 11 / 4), Math.PI * 7 / 4);
        }

        camera.rotate[0] = diapazoneX(camera.rotate[0] + (Y - this.state.clickPosition[1]) * 0.01 * Math.cos(-camera.rotate[1] + Math.PI / 4));
        camera.rotate[2] = diapazoneY(camera.rotate[2] - (Y - this.state.clickPosition[1]) * 0.01 * Math.sin(-camera.rotate[1] + Math.PI / 4));
        camera.rotate[1] += (X - this.state.clickPosition[0]) * 0.01;

        var time = new Date().getTime();

        this.setState({
            camera: camera,
            clickPosition: [X, Y],
            lastClickedTime: time,
            isNeedUpdate: true
        })
    }

    hundleKeyDown(e) {
        var pressedKeys = this.state.pressedKeys;

        switch (e.keyCode) {
            case 32:  // space
                pressedKeys |= 1;
                break;
            case 81:  // Q  -  вниз
                pressedKeys |= 2;
                break;
            case 69:  // E  -  вверх
                pressedKeys |= 4;
                break;
            case 83:  // S  -  вперёд
                pressedKeys |= 8;
                break;
            case 87:  // W  -  назад
                pressedKeys |= 16;
                break;
            case 68:  // D  -  вправо
                pressedKeys |= 32;
                break;
            case 65:  // A  -  влево
                pressedKeys |= 64;
                break;
            default:
                return;
        }

        if (this.state.pressTimeout === null) {
            this.setState({ pressedKeys: pressedKeys, pressTimeout: setTimeout(this.hundleKeyPress, 15) });
        } else {
            this.setState({ pressedKeys: pressedKeys });
        }
    }

    hundleKeyUp(e) {
        var pressedKeys = this.state.pressedKeys;

        switch (e.keyCode) {
            case 32:  // space
                pressedKeys &= ~1;
                break;
            case 81:  // Q  -  вниз
                pressedKeys &= ~2;
                break;
            case 69:  // E  -  вверх
                pressedKeys &= ~4;
                break;
            case 83:  // S  -  вперёд
                pressedKeys &= ~8;
                break;
            case 87:  // W  -  назад
                pressedKeys &= ~16;
                break;
            case 68:  // D  -  вправо
                pressedKeys &= ~32;
                break;
            case 65:  // A  -  влево
                pressedKeys &= ~64;
                break;
            default:
                return;
        }

        if (pressedKeys == 0) {
            clearTimeout(this.state.pressTimeout);
            this.setState({ pressedKeys: pressedKeys, pressTimeout: null });
        } else {
            this.setState({ pressedKeys: pressedKeys });
        }
    }

    hundleKeyPress() {
        var camera = this.state.camera;
        var dPosition = 0.1 * this.state.camera.resolution;
        var angle = camera.rotate[1] + Math.PI / 4;
        var pressedKeys = this.state.pressedKeys;

        if ((pressedKeys & 1) != 0) {
            camera.rotate[0] = Math.PI * 2;
            camera.rotate[2] = Math.PI * 2;
        }

        if ((pressedKeys & 2) != 0) {
            camera.position[1] += dPosition;
        }

        if ((pressedKeys & 4) != 0) {
            camera.position[1] -= dPosition;
        }

        if ((pressedKeys & 8) != 0) {
            camera.position[2] -= dPosition / 2 * Math.sin(angle);
            camera.position[0] -= dPosition / 2 * Math.cos(angle);
        }

        if ((pressedKeys & 16) != 0) {
            camera.position[2] += dPosition / 2 * Math.sin(angle);
            camera.position[0] += dPosition / 2 * Math.cos(angle);
        }

        if ((pressedKeys & 32) != 0) {
            camera.position[2] += dPosition / 2 * Math.cos(angle);
            camera.position[0] -= dPosition / 2 * Math.sin(angle);
        }

        if ((pressedKeys & 64) != 0) {
            camera.position[2] -= dPosition / 2 * Math.cos(angle);
            camera.position[0] += dPosition / 2 * Math.sin(angle);
        }

        this.setState({ camera: camera, pressTimeout: setTimeout(this.hundleKeyPress, 15), isNeedUpdate: true });
    }

    loadCanvas() {
        var canvas = document.getElementById("canvas");
        canvas.tabIndex = 1000;
        canvas.style.outline = "none";
        canvas.addEventListener("keydown", canvas, false);
        const gl = initWebGL(canvas);

        if (!gl) {
            alert('Unable to initialize WebGL. Your browser or machine may not support it.');
            return;
        }

        // Initialize a shader program; this is where all the lighting
        // for the vertices and so forth is established.
        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

        // Collect all the info needed to use the shader program.
        // Look up which attribute our shader program is using
        // for aVertexPosition and look up uniform locations.
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                modelColor: gl.getUniformLocation(shaderProgram, 'uModelColor'),
                resolution: gl.getUniformLocation(shaderProgram, "uResolution")
            },
        };

        const buffer = initBuffers(gl);

        this.setState({ gl: gl, buffer: buffer, programInfo: programInfo });

        setTimeout(this.loadEntity, 20);
        setTimeout(this.drawScene, 30);
    }

    loadEntity() {
        var gl = this.state.gl

        var entities = this.state.entities;
        entities.forEach(e => calculateEntity(gl, this.state.entity, e));

        this.setState({ entities: entities, isNeedUpdate: true });
    }

    drawScene() {
        if (!this.state.isNeedUpdate) {
            setTimeout(this.drawScene, 30);
            return;
        }

        var gl = this.state.gl;
        var programInfo = this.state.programInfo;
        var buffers = this.state.buffer;
        var camera = this.state.camera;
        var entities = this.state.entities;

        setSettings(gl); // Установление первоначальных настроек

        gl.useProgram(programInfo.program); // Установление шейдерной программы

        var [projectionMatrix, viewProjectionMatrix] = setCamera(gl, camera); // Получение камеры для объектов

        var modelViewMatrix = computeMatrix(
            viewProjectionMatrix,
            camera.position,
            camera.rotate[0],
            camera.rotate[2]);

        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition);
        }

        // Set the shader uniforms

        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.resolution,
            false,
            scaling(1.0, 1.0, 1.0));

        drawAxes(gl, camera.resolution, programInfo.uniformLocations.modelColor);

        draw(gl, [0, 0, 0, 1], programInfo.uniformLocations.modelColor, gl.POINTS, [-camera.position[0], -camera.position[1], -camera.position[2]], 1);

        gl.uniformMatrix4fv(programInfo.uniformLocations.resolution,
            false,
            scaling(camera.resolution, camera.resolution, camera.resolution));

        entities.forEach(e => drawEntity(gl, programInfo.uniformLocations.modelColor, e));

        this.setState({ isNeedUpdate: false });

        setTimeout(this.drawScene, 30);
    }

    async getEntities(text) {
        const response = await fetch(`${text}`);
        console.log(response);
        const data = await response.json();
        console.log(data);
    }

    onSendind() {
        var text = document.getElementById("fetching");
        console.log(text.value);
        this.getEntities(text.value);
    }

    addEntity() {
        this.getEntities('weatherforecast');
        //var entities = this.state.entities;
        //var lastId = this.state.entityLastId;
        //entities.push({
        //    id: ++lastId,
        //    entity: new Entity().getDefaultEntity()
        //})

        //this.setState({ entityLastId: lastId, entities: entities });

        //this.loadEntity();

        return;
    }

    editEntity(id, subId, data) {
        var entities = this.state.entities
        var entity = entities.find(v => v.id == id).entity[subId];

        Object.keys(data).forEach(v => {
            entity[v] = data[v];
        });

        this.setState({ entities: entities });

        this.loadEntity();
    }

    removeEntity(id, subId) {
        var entities = this.state.entities;
        var index = entities.findIndex((v) => v.id == id);
        var isDeleting = false;
        if (subId >= 0) {
            var entity = entities[index].entity;
            entity.splice(subId, 1);
            isDeleting = (entity.length == 0);
        } else {
            isDeleting = true;
        }

        if (isDeleting) {
            entities.splice(index, 1);
        }

        this.setState({ entities: entities });

        this.loadEntity();
    }

    hideEntity(id) {
        var entities = this.state.entities;
        var entity = entities.find(v => v.id == id);
        entity.isHiden = !entity.isHiden;

        this.setState({ entities: entities, isNeedUpdate: true });
    }

    changeValue(value) {
        var camera = this.state.camera;
        camera.resolution = calculateResolution(value) * 0.02;
        this.setState({ camera: camera, isNeedUpdate: true });

        return camera.resolution;
    }

    changeCountAngles(value) {
        var entity = this.state.entity;
        entity.countAngles = +value;
        this.setState({ entity: entity });

        this.loadEntity();

        return value;
    }

    changeAngle(value) {
        var entity = this.state.entity;
        entity.angle = +value;
        var entities = this.state.entities;
        entities[0].entity[0].rotation[1] = +value;
        this.setState({ entity: entity, entities: entities });

        this.loadEntity();

        return value;
    }

    changeThickness(value) {
        var entity = this.state.entity;
        entity.thickness = +value;
        this.setState({ entity: entity });

        this.loadEntity();

        return value;
    }

    changeLines(value) {
        var entity = this.state.entity;
        entity.lines = +value;
        this.setState({ entity: entity });

        this.loadEntity();

        return value;
    }

    changeParts(value) {
        var entity = this.state.entity;
        entity.parts = +value;
        this.setState({ entity: entity });

        this.loadEntity();

        return value;
    }

    render() {
        var dimension = [window.innerWidth, window.innerHeight - 64];

        return (
            <div>
                <canvas id="canvas" width={dimension[0]} height={dimension[1]}
                    onMouseDown={this.hundleMouseDown} onMouseUp={this.hundleMouseUp} onMouseMove={this.hundleMouseMove}
                    onKeyDown={this.hundleKeyDown} onKeyUp={this.hundleKeyUp}>
                </canvas>
                <EntityContainer entities={this.state.entities} onAdd={this.addEntity} onEdit={this.editEntity} onRemove={this.removeEntity} onHide={this.hideEntity}></EntityContainer>
                {/*<LogElement></LogElement>*/}
                <div id="scales" className="scales">
                    <ComponentSlider id="scale" stringFormat={ToStringScaleFormat} displayText='Resolution' changeFunction={this.changeValue}
                        min={5} max={50} current={35} value={this.state.camera.resolution}>
                    </ComponentSlider>
                    <ComponentSlider id="count" stringFormat={ToStringCountFormat} displayText='Count angles' changeFunction={this.changeCountAngles}
                        min={3} max={100} current={this.state.entity.countAngles} value={this.state.entity.countAngles}>
                    </ComponentSlider>
                    <ComponentSlider id="angle" stringFormat={ToStringCountFormat} displayText='Angle' changeFunction={this.changeAngle}
                        min={0} max={Math.PI * 2.0000001} step={Math.PI / 64} current={0} value={0}>
                    </ComponentSlider>
                    <ComponentSlider id="thickness" stringFormat={ToStringCountFormat} displayText='Thickness' changeFunction={this.changeThickness}
                        min={0.01} max={1} step={0.005} current={this.state.entity.thickness} value={this.state.entity.thickness}>
                    </ComponentSlider>
                    <ComponentSlider id="lines" stringFormat={ToStringCountFormat} displayText='On lines' changeFunction={this.changeLines}
                        min={1} max={50} step={1} current={this.state.entity.lines} value={this.state.entity.lines}>
                    </ComponentSlider>
                    <ComponentSlider id="parts" stringFormat={ToStringCountFormat} displayText='On parts' changeFunction={this.changeParts}
                        min={1} max={50} step={1} current={this.state.entity.parts} value={this.state.entity.parts}>
                    </ComponentSlider>
                </div>
                {/*<div style={{ position: "absolute", bottom: "100px" }}><input id="fetching" /><button onClick={this.onSendind}>send</button></div>*/}
            </div>
        );
    }
}

function calculateResolution(value) {
    return (1 / 25) * value * value + 0.08;
}
