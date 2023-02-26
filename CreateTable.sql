CREATE TABLE config (
    SaveAllImage_convert BOOLEAN DEFAULT 1,
    Screenhot_format TEXT DEFAULT "webp",
    global_color TEXT DEFAULT "#ffffff",
    user TEXT
);

CREATE TABLE AnimeTodo (
    user TEXT,
    name TEXT,
    an TEXT,
    episode TEXT
);
