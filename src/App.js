import { useContext, useEffect, useState } from 'react';
import { BrowserProvider } from "ethers";
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import logo from './images/dapps logo.jpg';
import { setMessageFn, shortenAddress } from './utils';
import Home from './pages/home/home';
import { MdAccountBalanceWallet, MdError, MdOutlineAssignment } from 'react-icons/md';
import { FaCircleCheck, FaUser, FaUserPlus } from 'react-icons/fa6';
import { AppContext } from './components/context';
import ClassRoom from './pages/class/class';
import MakeAdmin from './pages/modals/makeAdmin';
import { classRoomData } from './config';
import UsersModal from './pages/modals/users';

function App() {
  const { contract, setContract, message, setMessage, classRooms } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [searchLists, setSearchLists] = useState([]);
  const [connecting, setConnecting] = useState(false);
  const [adminModal, setAdminModal] = useState(false);
  const navigate = useNavigate();
  const placeholder = `Search for a class...`;

  async function loadContract() {
    if (!window.ethereum) {
      throw new Error("No crypto wallet found. Please install MetaMask.");
    }
    setConnecting(true);
    const provider = await new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setContract({ signer, address });
    setMessage({ status: 'success',})
    setConnecting(false);
  };


  function connectWallet() {
    if(contract.address) return;

    if (!window.ethereum) return setMessageFn(setMessage, 'Install Metamask extension!');

    loadContract().catch(error => {
      console.error('Error connecting wallet', error);
      setMessageFn(setMessage, 'Error connecting wallet');
      setConnecting(false);
    });
  };

  const handleChange = (e) => {
    // its confirmed you can search with classRooms data here
    setSearch(e.target.value);
  };

  useEffect(() => {
      if(!search) setSearchLists([]);
      else {
        const srch = [];
        for(const classRoom of classRooms) {
          if(classRoom.name.toLowerCase().startsWith(search.toLowerCase())) srch.push(classRoom);
        }
        setSearchLists(srch);
      }
  }, [search]);

  return (
    <div className="App">
      <div className='app'>

        <div className={`message-alert ${message.message ? true : false}`}>
          <div className='alert'>
            {
              message.status === 'error' ?
              <MdError className='alert-icon alert-error' /> :
              <FaCircleCheck className='alert-icon alert-success' />
            }
            <span className='alert-txt'>{message.message}</span>
          </div>
        </div>

        <header className='app-header'>
          <div className='app-logo cursor' onClick={() => navigate('/app')}>
            <img src={logo} alt='logo' />
          </div>
          <h2 className='cursor' onClick={() => navigate('/app')}>Dapps Over Apps Classroom</h2>
          <div className='app-header-input-div'>
            <input placeholder={placeholder} onChange={handleChange} value={search||""} />

            {searchLists.length > 0 && <div className='app-header-input-dropdown'>
              <ul>
                {searchLists.map((val, idx) => (
                  <li className='ahid-li cursor' key={`ahdi-${idx}`} onClick={() => {
                    setSearch("");
                    navigate(`/app/class/${val._id}`);
                  }}>
                    <div className='ahid-icon-div'>
                      <MdOutlineAssignment className="ahid-icon" />
                    </div>
                    <span>{val.name}</span>
                  </li>
                ))}
              </ul>
            </div>}
          </div>

          {
            contract.isAdmin && 
            <div className='is-admin' title='Admin'>
              <div className='make-admin cursor' onClick={() => setAdminModal(!adminModal)}>
                <FaUser className='mka-icon' />
                <span>Admin</span>
              </div>

              {adminModal && <div className='is-admin-dropdown'>
                <div className='iad cursor' onClick={() => setAdminModal('make-admin')}>
                  <FaUserPlus className='iad-icon' />
                  <span>Make Admin</span>
                </div>
                <div className='iad cursor' onClick={() => setAdminModal('view-users')}>
                  <FaUser className='iad-icon' />
                  <span>View users</span>
                </div>
              </div>}
            </div>
          }

          <button className={`app-wallet ${contract.address||connecting ? 'false' : 'cursor'}`} 
          onClick={() => connectWallet()} disabled={contract.address||connecting ? true : false}>
            <MdAccountBalanceWallet className='aw-icon' />
            <span className='aw-txt'>
              {connecting ? 'Connecting...' : !contract.address ? 'Connect' : shortenAddress(contract.address)}
            </span>
          </button>
        </header>

        <main>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/class/:id/*'  element={<ClassRoom />} />
          </Routes>

        </main>
      </div>

      {adminModal === 'make-admin' && <MakeAdmin closeModal={() => setAdminModal(false)} />} 

      {adminModal === 'view-users' && <UsersModal closeModal={() => setAdminModal(false)} />}
    </div>
  );
}

export default App;
