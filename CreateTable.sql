CREATE TABLE config (
    SaveAllImage_convert BOOLEAN DEFAULT 1,
    ScreenShot_format TEXT DEFAULT "webp",
    global_color TEXT DEFAULT "#ffffff"
);

CREATE TABLE AnimeTodo (
    user TEXT,
    name TEXT,
    an TEXT,
    episode TEXT
);
