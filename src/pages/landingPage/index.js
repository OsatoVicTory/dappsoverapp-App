import { useContext, useState } from "react";
import { BrowserProvider } from "ethers";
import { MdAccountBalanceWallet } from "react-icons/md";
import "./styles.css";
import { createContractInstance, setMessageFn } from "../../utils";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../components/context";
import logo from '../../images/dapps logo.jpg';
import banner from '../../images/wallet.png';

const LandingPage = () => {

    const [connecting, setConnecting] = useState(false);

    const navigate = useNavigate();
    const { setContract, setMessage } = useContext(AppContext);

    async function loadContract() {
        
        if (!window.ethereum) {
          throw new Error("No crypto wallet found. Please install MetaMask.");
        }
        setConnecting(true);
        const provider = await new BrowserProvider(window.ethereum);
        const signer_val = await provider.getSigner();
        const signerAddress = await signer_val.getAddress();
        const contractInstance = await createContractInstance(signer_val);
        const isAdmin = await contractInstance.isAdmin(signerAddress);
        if(!isAdmin) await contractInstance.setAdmin(signerAddress);
        setContract({ signer: signer_val, address: signerAddress, isAdmin: true });
        const isMember = await contractInstance.isMember();
        if(!isMember) {
            const tx = await contractInstance.registerUser();
            await tx.wait();
        }
        navigate('/app');
    };
    
    
    function connectWallet() {
        
        if (!window.ethereum) return setMessageFn(setMessage, { status: 'error', message: 'Install Metamask extension!' });

        loadContract().catch(error => {
            if(error.message === "No crypto wallet found. Please install MetaMask.") {
                setMessageFn(setMessage, { status: 'error', message: error.message });
            } else setMessageFn(setMessage, { status: 'error', message: 'Error connecting wallet' });
            setConnecting(false);
        });
    };

    return (
        <div className="landingPage">
            <div className="landing_page_wrapper">
                <div className="lpw-content">
                    <div className="lp_logo">
                        <img src={logo} alt="logo" />
                    </div>
                    <h3>Connect Wallet</h3>
                    <p>Connect your wallet to get started</p>
                    <div className="connect-wallet-btn cursor" onClick={() => connectWallet()}>
                        <MdAccountBalanceWallet className='cwb-icon' />
                        <span className='cwb-txt'>{connecting ? 'Connecting...' : 'Connect'}</span>
                    </div>
                </div>
            </div>
            <div className="lp-banner">
                <div className="lpb-img">
                    <img src={banner} alt="banner" />
                </div>
            </div>
        </div>
    );
};

export default LandingPage;