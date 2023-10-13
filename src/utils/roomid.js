const generateRoomId = (userId1, userId2) => {
    const sortedUserIds = [userId1, userId2].sort();
    return `${sortedUserIds[0]}_${sortedUserIds[1]}`;
};
export default generateRoomId