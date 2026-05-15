module.exports = (io, socket) => {
  socket.on('adminJoin', () => {
    socket.join('admin_tracking');
    console.log('Admin joined tracking room');
  });
};
