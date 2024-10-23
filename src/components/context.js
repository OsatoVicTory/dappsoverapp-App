import { createContext, useState } from 'react';

const AppContext = createContext({
    contract: {},
    setContract: () => {},
    message: {},
    setMessage: () => {},
    classRooms: [],
    setClassRooms: () => {},
    users: [],
    setUsers: () => {},
    usersLoaded: false,
    setUsersLoaded: () => {},
});

const AppProvider = ({ children }) => {
    const [contract, setContract] = useState({});
    const [message, setMessage] = useState({});
    const [classRooms, setClassRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const [usersLoaded, setUsersLoaded] = useState(false);

    return (
        <AppContext.Provider value={{ 
            contract, setContract, message, setMessage, classRooms, 
            setClassRooms, users, setUsers, usersLoaded, setUsersLoaded 
        }}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };