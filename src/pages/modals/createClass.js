import { useContext, useEffect, useRef, useState } from "react";
import './styles.css';
import { AiOutlineClose } from "react-icons/ai";
import { createContractInstance, parseStringData, setMessageFn } from "../../utils";
import { AppContext } from "../../components/context";
import { MdSend } from "react-icons/md";

const CreateClass = ({ closeModal }) => {

    const { contract, setMessage, classRooms, setClassRooms } = useContext(AppContext);
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
        
        const missing = ['name', 'topic', 'creator', 'description'].find(key => !formData[key]);
        if(missing) return setMessageFn(setMessage, { status: 'error', message: `Please fill ${missing} form` });

        setSendLoading(true);
        sendLoadingRef.current = true;

        try {
            const { img_url } = formData;
            if(img_url.startsWith('https://drive.google.com')) {
                const img_id = img_url.split('/')[5];
                if(img_id) formData.img_url = `https://drive.google.com/thumbnail?id=${img_id}&sz=4000`;
            }
            const input_data = Object.keys(formData).map(key => `${key}=${formData[key]}`);
            const stringifiedData = `[${input_data.join('%x2')}]`;
            // console.log('strData', stringifiedData);
            const contractInstance = await createContractInstance(contract.signer);
            const tx = await contractInstance.createClass(formData.name, stringifiedData);
            await tx.wait();
            const date = Math.floor(new Date().getTime() / 1000);
            setClassRooms([{ ...formData, created_at: date, _id: classRooms.length }, ...classRooms]);
            setMessageFn(setMessage, { status: 'success', message: 'Class created successfully.' });
            sendLoadingRef.current = false;
            closeModal(); 
        } catch (err) {
            // console.log(err);
            setSendLoading(false);
            sendLoadingRef.current = false;
            setMessageFn(setMessage, { status: 'error', message: 'Error creating class. Retry.' });
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
                    <span className="Mc-txt">Create class</span>
                    <AiOutlineClose className="Mc-icon cursor" onClick={() => closeModal()} />
                </div>
                <main>
                    <div className='Modal__Form'>
                        <div className="input-field">
                            <label>Class Name</label>
                            <input placeholder="Enter a name for the class" onChange={handleChange} name="name" />
                        </div>
                        <div className="input-field">
                            <label>Banner image (Can use link from google drive)</label>
                            <input placeholder="Enter url of image here" onChange={handleChange} name="img_url" />
                        </div>
                        <div className="input-field">
                            <label>Topic to be dicussed</label>
                            <input placeholder="Enter a topic" onChange={handleChange} name="topic" />
                        </div>
                        <div className="input-field">
                            <label>Class Created by</label>
                            <input placeholder="Enter name" onChange={handleChange} name="creator" />
                        </div>
                        <div className="input-field">
                            <label>Class description</label>
                            <textarea placeholder="Describe the class" onChange={handleChange} name="description" />
                        </div>
                    </div>
                    <div className="Modal__Send">
                        <div className="Mc-send cursor" onClick={() => handleSend()}>
                            <MdSend className="Mcs-icon" />
                            <span className="Mcs-txt">{sendLoading ? 'Creating...' : 'Create'}</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CreateClass;