const usersList: any = [];

const joinUser = (id: any, username: any, room: any, pubkey: any) => {
  const newUser = { id, username, room, pubkey };
  usersList.push(newUser);
  console.log('A new user has been added');
  console.log(`There are: ${usersList.length} users connected`);

  return newUser;
};

const getUserID = (id: any) => {
  return usersList.find((user: any) => user.id === id);
};

const userDisconnect = (id: any) => {
  const index = usersList.findIndex((user: any) => user.id === id);

  if (index !== -1) {
    return usersList.splice(index, 1)[0];
  }
};

export { joinUser, getUserID, userDisconnect, usersList };
