import React, { Component, PureComponent } from 'react';
import {GridItem, Button, Grid} from './GridItem'
import { string } from 'prop-types';
import ModalPopup from './modal_popup'
import KBListner from './keyboard_listener'
import axios from 'axios'

enum KeyType {
    Up = 1,
    Down = 2,
}

function fromEventStr(s: string): KeyType {
    switch (s) {
        case "keydown": return KeyType.Down;
        case "keyup": return KeyType.Up;
    }

    throw "Invalid macro string" ;
}

function toString(t: KeyType): string {
    switch (t) {
        case KeyType.Down: return "↓";
        case KeyType.Up: return "↑";
    }
}

interface MacroItem {
    key: string;
    type: KeyType;
}

interface TileEditProps {
    onSave: (macro: MacroItem[]) => void;
    lastMacro: MacroItem[];
}

interface TileEditState {
    macro: MacroItem[];
    isRecording: boolean;
}
class TileEdit extends Component<TileEditProps, TileEditState> {
    listener: KBListner;

    constructor(props: TileEditProps) {
        super(props);
        this.onRecord = this.onRecord.bind(this);
        this.state = {
            macro: props.lastMacro,
            isRecording: false
        }

        this.deleteRow = this.deleteRow.bind(this);

        let kb_callback = (e: KeyboardEvent) => {
            let newMacros: MacroItem[] = this.state.macro;
            newMacros.push({
                key: e.key,
                type: fromEventStr(e.type)
            });
            this.setState({
                macro: newMacros
            });
        };

        this.listener = new KBListner(kb_callback);
    }

    deleteRow(itemToDelete: MacroItem) {
        let newMacros: MacroItem[] = this.state.macro.filter(
            i => {
                return i !== itemToDelete;
            }
        )
        this.setState({
            macro: newMacros
        })
    }

    onRecord() {
        let state: TileEditState = this.state;
        state.isRecording = !state.isRecording;

        if (state.isRecording){
            state.macro = [];
            this.listener.start_listener();
        }
        else {
            this.listener.stop_listening();
        }
        
        this.setState(state);
    }

    render() {
        return (
            <div>
                <button onClick={this.onRecord}>
                    {this.state.isRecording ? "Stop recording" : "Record Macro"}
                </button>
                <table>
                    <tr>
                        <th>Key</th>
                        <th>type</th>
                        <th>-</th>
                    </tr>
                    {this.state.macro.map((item: MacroItem) => {
                        return (
                            <tr>
                                <td>{item.key}</td>
                                <td>{toString(item.type)}</td>
                                <td><button onClick={() => this.deleteRow(item)}>-</button></td>
                            </tr>)
                    })}
                </table>

                <button onClick={() => this.props.onSave(this.state.macro)}>save</button>
            </div>
        )
    }
}

interface TileProps {
    data: GridItem
}

interface TileState {
    macro: MacroItem[];
    showPopup: boolean;
}

class Tile extends Component<TileProps, TileState> {
    buttonPressTimer:any;

    constructor(props: TileProps) {
        super(props);
        this.state = {macro: [], showPopup: false}
        this.handlePress = this.handlePress.bind(this)
        this.handleRelease = this.handleRelease.bind(this)
        this.onClick = this.onClick.bind(this)
        this.save_tile = this.save_tile.bind(this)
    }

    handlePress() {
        let holdCb = () => {
            let state: TileState = this.state;
            state.showPopup = true;
            this.setState(state);
        };

        this.buttonPressTimer = setTimeout(holdCb, 500);
    }

    handleRelease() {
        clearTimeout(this.buttonPressTimer);
    }

    onClick() {
        
        alert("Running macro" + this.state.macro)
    }

    save_tile(macro: MacroItem[]) {
        axios.post('/save', macro)
        .then( r => {
            console.log(r);
            alert("save resopnse");
        })
        .catch(e => {
            console.log(e);
            alert("exception")
        })

        this.setState({
            showPopup: false,
            macro: macro
        });
    }

    renderMacroTable() {
        return(
            <table className="tile-table">
            <tr>
                <th>Key</th>
                <th>type</th>
            </tr>
            {this.state.macro.map((item: MacroItem) => {
                return (
                    <tr>
                        <td>{item.key}</td>
                        <td>{toString(item.type)}</td>
                    </tr>)
            })}
            </table>
        )
    }

    render() {
        let data: Button = this.props.data as Button;
        return (
            <div className="tile" >
                <div  className="tile tile-internal"
                    onTouchStart={this.handlePress} 
                    onTouchEnd={this.handleRelease} 
                    onMouseDown={this.handlePress} 
                    onMouseUp={this.handleRelease} 
                    onMouseLeave={this.handleRelease}
                    onClick={this.onClick}
                >
                    {this.renderMacroTable()}
                    <h3>{data.name}</h3>
                </div>
                <ModalPopup visible={this.state.showPopup}>
                    <h1>{data.name}</h1>
                    <TileEdit lastMacro={this.state.macro} onSave={this.save_tile} />
                </ModalPopup>
            </div>
        )
    }
}


export class TilesView extends Component<{}, Grid> {
    public readonly default_data: Grid = new Grid([
        new Button("name 1", "action 1"),
        new Button("name 2", "action 2")
    ]);

    constructor(props: any) {
        super(props);
        this.state = new Grid(null);
        this.load_grid();
    }
    
    load_grid() {
        axios.get('/api/grid')
            .then( r => {
                let jsonObj = r.data;
                let gridData: Grid = jsonObj;
                console.log(gridData);
                this.setState(gridData)                
            })
            .catch(e => {
                this.setState(this.default_data);
                console.log(e);
            })
    }

    renderTiles(tile_list: GridItem[] | null) {
        if (tile_list === null) {
            return;
        }

        let elms: JSX.Element[] = []
        for (let tile of tile_list) {
            elms.push(<Tile data={tile} />)
        }

        return (
            <div>{elms}</div>
        )
    }

    render() {
        let data: Grid = this.state;
        return (  
            <div>
                {/* <ModalPopup visible={true}>
                    <h2>hello</h2>
                </ModalPopup> */}
                {this.renderTiles(data.items)}
            </div>
        )
    }
}

export default TilesView