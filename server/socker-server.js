const io = require("socket.io")(3001, { cors: { origin: "*" } });
let tables = [];

io.on("connection", (socket) => {
  socket.emit("init", tables);
  socket.on("reserve", (id) => {
    tables = tables.map((t) =>
      t.id === id ? { ...t, reserved: true } : t
    );
    io.emit("table-updated", tables);
  });
});