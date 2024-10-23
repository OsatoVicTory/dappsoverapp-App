import { useContext, useEffect, useRef, useState } from "react";
import './styles.css';
import { AiOutlineClose } from "react-icons/ai";
import { createContractInstance, setMessageFn } from "../../utils";
import { AppContext } from "../../components/context";
import { MdSend } from "react-icons/md";

const MakeAdmin = ({ closeModal }) => {

    const { contract, setMessage } = useContext(AppContext);
    const [formData, setFormData] = useState({});
    const [sendLoading, setSendLoading] = useState(false);
    const modalRef = useRef();
    const sendLoadingRef = useRef();
    
    function clickFn(e) {
        if(!modalRef.current) return;
        if(modalRef.current && !modalRef.current.contains(e.target)) { 
            // ensure sendLoading is done before user can leave this page
            if(sendLoadingRef.current) return setMessageFn(setMessage, { status: 'error', message: `Wait till request is done` });
            closeModal(); 
        }
    };

    useEffect(() => {
        document.addEventListener("click", clickFn, true);

        return () => document.removeEventListener("click", clickFn, true);
    }, []);

    const handleSend = async () => {
        if(sendLoading) return setMessageFn(setMessage, { status: 'error', message: 'Currently sending a request.' });

        if(!formData.address) return setMessageFn(setMessage, { status: 'error', message: 'Add user wallet address.' });

        setSendLoading(true);
        sendLoadingRef.current = true;

        try {
            const contractInstance = await createContractInstance(contract.signer);
            const tx = await contractInstance.setAdmin(formData.address);
            await tx.wait();
            setMessageFn(setMessage, { status: 'success', message: 'Successful.' });
            sendLoadingRef.current = false;
            setSendLoading(false);
            closeModal(); 
        } catch (err) {
            // console.log(err);
            setSendLoading(false);
            sendLoadingRef.current = false;
            setMessageFn(setMessage, { status: 'error', message: 'Error sending your request. Retry.' });
        }
    };

    function handleChange(e) {
        const { value, name } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className='__Modal__Overlay__'>
            <div className="Modal__Content" ref={modalRef}>
                <div className="MC-top">
                    <span className="Mc-txt">Make Admin</span>
                    <AiOutlineClose className="Mc-icon cursor" onClick={() => closeModal()} />
                </div>
                <main>
                    <div className='Modal__Form'>
                        <p>Send a request to make user an admin using their wallet address</p>
                        <div className="input-field">
                            <label>User wallet address</label>
                            <input placeholder="Enter user wallet address" onChange={handleChange} name="address" />
                        </div>
                    </div>
                    <div className="Modal__Send no-border">
                        <div className="Mc-send cursor" onClick={() => handleSend()}>
                            <MdSend className="Mcs-icon" />
                            <span className="Mcs-txt">{sendLoading ? 'Sending...' : 'Send'}</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MakeAdmin;