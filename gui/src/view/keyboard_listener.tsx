
type kb_done_callback_type = (events: KeyboardEvent[]) => void;
type kb_callback_type = (events: KeyboardEvent) => void;

class KBListner {
    public keypress_cb: kb_callback_type | null;

    private keyDown: (e:KeyboardEvent) => void;
    private keyUp: (e:KeyboardEvent) => void;

    constructor(keypress: kb_callback_type | null) {
        this.keypress_cb = keypress;

        this.keyUp = (e:KeyboardEvent) => {
            e.preventDefault();

            if (this.keypress_cb !== null) {
                this.keypress_cb(e);
            }
        }

        this.keyDown = (e:KeyboardEvent) => {
            e.preventDefault();

            if (e.repeat)
                return;

            if (this.keypress_cb !== null) {
                this.keypress_cb(e);
            }
        }        
    }

    public start_listener() {
        document.addEventListener("keydown", this.keyDown);
        document.addEventListener("keyup", this.keyUp);
    }

    public stop_listening() {
        document.removeEventListener("keyup", this.keyUp);
        document.removeEventListener("keydown", this.keyDown);        
    }
}

export default KBListner;