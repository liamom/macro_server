export class Action {
    constructor() {

    }
}

export class Button{
    name: string;
    action: Action;

    constructor(name: string, action: Action) {
        this.name = name;
        this.action = action;
    }

}

export class Empty {}

export type GridItem = Button | Grid | Empty;

export class Grid {
    items: GridItem[] | null;

    constructor(items: GridItem[] | null) {
        this.items = items;
    }
}

// export default GridItem;