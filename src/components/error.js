import { BiSolidError } from 'react-icons/bi';
import './styles.css';
import { useContext, useState } from 'react';
import { BrowserProvider } from 'ethers';
import { createContractInstance, setMessageFn } from '../utils';
import { AppContext } from './context';

const ErrorPage = ({ text, refreshFn, important, btnName, setContractRef }) => {

    const { contract, setContract, setMessage } = useContext(AppContext);
    const [loading, setLoading] = useState(false);

    const fireFn = async () => {
        if(loading) return;
        
        try {
            // until contract state has been updated before we now fire the refresh
            if(contract.signer) return refreshFn();
            
            setLoading(true);

            if (!window.ethereum) {
                setLoading(false);
                setMessageFn(setMessage, { 
                    status: 'error', message: "No crypto wallet found. Please install MetaMask." 
                });
                return;
            }
            const provider = await new BrowserProvider(window.ethereum);
            const signer_val = await provider.getSigner();
            const signerAddress = await signer_val.getAddress();
            const contractInstance = await createContractInstance(signer_val);
            const isAdmin = await contractInstance.isAdmin(signerAddress);
            const isMember = await contractInstance.isMember();
            if(!isMember) {
                const tx = await contractInstance.registerUser();
                await tx.wait();
            }
            if(setContractRef) setContractRef({ signer: signer_val, address: signerAddress, isAdmin });
            setContract({ signer: signer_val, address: signerAddress, isAdmin });
            setLoading(false);
            if(setContractRef) refreshFn();
        } catch (err) {
            setMessageFn(setMessage, { status: 'error', message: 'There was an error. Check internet.' });
            setLoading(false);
        }
    };



    return (
        <div className='error-page'>
            <div>
                <div className='ep-iocn-div'>
                    <BiSolidError className='ep-icon' />
                </div>
                <p className='ep-h3'>
                    {!contract.signer ? 'No wallet connected. Connect your wallet to continue.' :
                    important ? (text || 'Reload') : 'There was an error loading the data. Check internet connection and Retry'}
                </p>
                <div className='ep-btn cursor' onClick={() => fireFn()}>
                    {loading ? 
                        ( !contract.signer ? 'Connecting...' : 'Retrying...' ) : 
                        ( !contract.signer ? 'Connect wallet' : btnName || 'Reload' )
                    }
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;