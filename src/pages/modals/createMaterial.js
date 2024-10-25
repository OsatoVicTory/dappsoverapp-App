import { useContext, useEffect, useRef, useState } from "react";
import './styles.css';
import { AiOutlineClose } from "react-icons/ai";
import { createContractInstance, fetchUrlPrieview, parseBigInt, parseStringData, setMessageFn, validLink } from "../../utils";
import { AppContext } from "../../components/context";
import { MdSend } from "react-icons/md";
import Previewer from "../../components/previewer";

const CreateMaterial = ({ closeModal, id, setMaterials }) => {

    const { contract, setMessage } = useContext(AppContext);
    const [formData, setFormData] = useState({});
    const [sendLoading, setSendLoading] = useState(false);
    const [previewData, setPreviewData] = useState({});
    const [previewLoading, setPreviewLoading] = useState(false);
    const modalRef = useRef();
    const sendLoadingRef = useRef();
    const linkRef = useRef();
    
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

        const missing = ['main_title', 'content'].find(key => !formData[key]);
        if(missing) return setMessageFn(setMessage, { status: 'error', message: `Please fill ${missing} form` });

        setSendLoading(true);
        sendLoadingRef.current = true;

        try {
            // 
            const input_data = (Object.keys(formData).map(key => `${key}=${formData[key]}`)).join('%x2');
            const preview_data = (Object.keys(previewData).map(key => `${key}=${previewData[key]}`)).join('%x2');
            const date = Math.floor(new Date().getTime() / 1000);
            // if preview_data = '', then parseStringData() will have handle the %x2''%x2 scenario as key will be '';
            const stringifiedData = `[${input_data}%x2${preview_data}%x2createdAt=${date}]`;
            // console.log('strData', stringifiedData);
            // console.log('parsedStrData', parseStringData(stringifiedData));
            const contractInstance = await createContractInstance(contract.signer);
            const tx = await contractInstance.addMaterial(stringifiedData, parseBigInt(id - 0));
            await tx.wait();
            setMaterials((prev) => [{ ...parseStringData(stringifiedData), _id: prev.length }, ...prev]);
            setMessageFn(setMessage, { status: 'success', message: 'Material uploaded successfully.' });
            sendLoadingRef.current = false;
            setSendLoading(false);
            closeModal(); 
        } catch (err) {
            // console.log(err);
            setSendLoading(false);
            sendLoadingRef.current = false;
            setMessageFn(setMessage, { status: 'error', message: 'Error uploading material. Retry.' });
        }
    };

    function handleChange(e) {
        const { value, name } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const firePreview = async () => {
        const { link } = formData;
        if(!link || !validLink(link)) return setMessageFn(setMessage, { status: 'error', message: `Please fill link form with valid link` });

        if(previewLoading) return setMessageFn(setMessage, { status: 'error', message: `Currently making a request.` });

        // uncomment in deployment
        if(link === linkRef.current) return;
        linkRef.current = link;

        setPreviewLoading(true);
        try {
            const res = await fetchUrlPrieview(link, 180000);
            // console.log('preview data', res);
            setPreviewData({ ...res.data, link });
            setPreviewLoading(false);
        } catch (err) {
            // console.log(err);
            setMessageFn(setMessage, { status: 'error', message: 'Preview took too long. Replacing with placeholder data' });
            // link will always have :// becuase of validLink fn above
            setPreviewData({ title: link.split('://')[1]?.split('.')[0], site: link, link });
            setPreviewLoading(false);
        }
    };

    return (
        <div className='__Modal__Overlay__'>
            <div className="Modal__Content" ref={modalRef}>
                <div className="MC-top">
                    <span className="Mc-txt">Create Material</span>
                    <AiOutlineClose className="Mc-icon cursor" onClick={() => closeModal()} />
                </div>
                <main>
                    <div className='Modal__Form'>
                        <div className="input-field">
                            <label>Material title</label>
                            <input placeholder="Enter a title" onChange={handleChange} name="main_title" />
                        </div>
                        <div className="input-field">
                            {previewData?.site && <div className='input-field-Preview'>
                                <Previewer data={previewData} />
                            </div>}

                            <div className="if-for-preview">
                                <label>Material link</label>
                                <div className='if-preview-div'>
                                    <div className="if-preview-btn cursor" onClick={() => firePreview()}>
                                        {!previewLoading ? 'Preview' : 'Previewing...'}
                                    </div>
                                    <div className="if-preview-describe">Get preview of link. N.B might take up to 3 mins</div>
                                </div>
                            </div>
                            <input placeholder="Enter a valid link with https" onChange={handleChange} name="link" />
                        </div>
                        <div className="input-field">
                            <label>Further notes on the material</label>
                            <textarea placeholder="Enter additional notes" onChange={handleChange} name="content" />
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

export default CreateMaterial;