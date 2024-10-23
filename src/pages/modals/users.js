import { useContext, useEffect, useRef, useState } from 'react';
import './styles.css';
import { AiOutlineClose } from 'react-icons/ai';
import { FaUser } from 'react-icons/fa6';
import Skeleton from '../../components/skeleton';
import { contractAddress } from '../../config';
import { AppContext } from '../../components/context';
import { Contract } from 'ethers';
import { formatDate, setMessageFn } from '../../utils';
import NoData from '../../components/nodata';
import ErrorPage from '../../components/error';

const UsersModal = ({ closeModal }) => {

    const { contract, setMessage, users, setUsers, usersLoaded, setUsersLoaded } = useContext(AppContext);
    const modalRef = useRef();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    function clickFn(e) {
        if(!modalRef.current) return;
        if(modalRef.current && !modalRef.current.contains(e.target)) { 
            closeModal(); 
        }
    };

    const fetchUsers = async () => {
        // only when users list is 0 we set loading to true else previous data is held as placeholder 
        // before new ones are fetched
        if(!usersLoaded) setLoading(true);
        else setLoading(false);

        setError(false);

        try {
            const abi = [
                "event Member(address indexed user)"
            ]
            const newContract = new Contract(contractAddress, abi, contract.signer);
            const filter = newContract.filters.Member();
            const transactionRes = await newContract.queryFilter(filter);
            // typeof transactionRes is object
            const data = [];
            for(const { args, blockNumber } of transactionRes) {
                const [from] = args;
                let time_stamp = '';

                {

                    await new Promise(res => setTimeout(res, 300));
               
                    const apiUrl = `https://api-sepolia.arbiscan.io/api?module=block&action=getblockreward&blockno=${blockNumber}`;
                    const res = await fetch(apiUrl);
                    const res_data = await res.json();
                    if(res_data.status === '1') {
                        const timestamp = parseInt(res_data.result.timeStamp, 10);
                        time_stamp = timestamp;
                    }

                    data.push({ address: from, joinedAt: time_stamp });
                }
            };
            setUsers([...data.reverse()]);
            setUsersLoaded(true);
            setLoading(false);
        } catch (err) {
            // console.log(err);
            setMessageFn(setMessage, { status: 'error', message: 'There was an error. Check internet.' });
            if(!usersLoaded) setError(true);
            setLoading(false);
        }
    };

    useEffect(() => {

        fetchUsers();

        document.addEventListener("click", clickFn, true);

        return () => document.removeEventListener("click", clickFn, true);
    }, []);

    return (
        <div className='__Modal__Overlay__'>
            <div className="Modal__Content Users" ref={modalRef}>
                {
                    error ?

                    <div className='MCU-error'>
                        <ErrorPage text={'There was an error. Check internet and Retry.'} refreshFn={() => fetchUsers()} />
                    </div> :

                    users.length === 0 ?

                    <div className='MCU-no-data'>
                        <NoData text={'No users on this platform yet.'} />
                    </div> :

                    <div className='MC-users'>
                        <div className="MC-top">
                            <span className="Mc-txt">Users</span>
                            <AiOutlineClose className="Mc-icon cursor" onClick={() => closeModal()} />
                        </div>
                        <main>
                            <ul className='users-li'>
                                {users.map((val, idx) => (
                                    <li key={`us-${idx}`} className='user-li'>
                                        <div className={`ul-icon-div ${loading ? 'sk-loading' : ''}`}>
                                            {loading ? <Skeleton /> : <FaUser className='ul-icon' />}
                                        </div>
                                        {
                                            !loading ? 
                                            <div className='ul-txt'>
                                                <span className='ult-address'>{val.address}</span>
                                                <span className='ult-time'>Joined {formatDate(val.joinedAt)}</span>
                                            </div> :
                                            <div className='ul-txt'>
                                                <div><Skeleton /></div>
                                                <div className='ult-time'><Skeleton /></div>
                                            </div>
                                        }
                                    </li>
                                ))}
                            </ul>
                        </main>
                    </div>
                }
            </div>
        </div>
    );
};

export default UsersModal;