use serde::{Deserialize, Serialize};
use serde_json::Result;

#[derive(Serialize, Deserialize)]
struct Keyboard {
    //js stuff
    which: i32,
    key: char,
    key_code: i32,
    code: String,
}

#[derive(Serialize, Deserialize)]
enum Action {
    KeyUp(Keyboard),
    KeyDown(Keyboard),
    None,
}

#[derive(Serialize, Deserialize)]
struct Button {
    name: String,
    action: Action,
}

impl Button {
    pub fn new() -> Self {
        Button {
            name: "default 1".to_string(),
            action: Action::None,
        }
    }
}

#[derive(Serialize, Deserialize)]
enum GridItem {
    Folder(Box<Grid>),
    Button(Button),
    Empty
}

#[derive(Serialize, Deserialize)]
pub struct Grid {
    items: [GridItem; 15]
}

impl Grid {
    pub fn new() -> Grid {
        Grid {
            items: [
                GridItem::Button(Button::new()), GridItem::Empty, GridItem::Empty, GridItem::Empty, GridItem::Empty,
                GridItem::Empty, GridItem::Empty, GridItem::Empty, GridItem::Empty, GridItem::Empty,
                GridItem::Empty, GridItem::Empty, GridItem::Empty, GridItem::Empty, GridItem::Empty,
            ]
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::macro_data::Grid;

    #[test]
    fn grid_new() {
        let g = Grid::new();
        let j = serde_json::to_string(&g).unwrap();
        assert_eq!(j, "");

    }
}