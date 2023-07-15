import React from 'react';

type UserData = {
  username?: string,
  userId?: number,
  authenticated?: boolean
};

const UserContext = React.createContext<[UserData, React.Dispatch<React.SetStateAction<UserData>>]|undefined>(undefined);

export { UserContext };
export type { UserData };