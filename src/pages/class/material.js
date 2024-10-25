import { MdContentCopy, MdOutlineArrowBack, MdOutlineAssignment, MdOutlineKeyboardDoubleArrowLeft } from 'react-icons/md';
import LoadingSpinner from '../../components/loadingSpinner';
import './class.css';
import './material.css';
import './loading.css';
import { useContext, useEffect, useRef, useState } from 'react';
import { createContractInstance, formatDate, parseBigInt, parseJSONStringData, parseStringData, setMessageFn } from '../../utils';
import { useNavigate, useParams } from 'react-router-dom';
import Previewer from '../../components/previewer';
import NoData from '../../components/nodata';
import MaterialLoading from './material_loading';
import Skeleton from '../../components/skeleton';
import { FRONTEND_URL } from '../../config';
import { AppContext } from '../../components/context';
import ErrorPage from '../../components/error';
import ModifyMaterial from '../modals/modifyMaterial';

const ClassRoomMaterial = ({ classRoom, materials, setClassRoom, setMaterials, loaded, setLoaded }) => {

    const { contract, setMessage } = useContext(AppContext);
    const contractRef = useRef(contract);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [error, setError] = useState(false);
    const [route, setRoute] = useState('Material');
    const [materialsLoading, setMaterialsLoading] = useState(true);
    const [material, setMaterial] = useState({});
    const contentRef = useRef();
    const classRoomError = 'No Class like this';
    const materialError = 'No material like this in this class';

    const navigate = useNavigate();
    const { id, material_id } = useParams();

    const image = 'https://lh3.googleusercontent.com/hr_crs_themes/ACP_IjEUeuVRrv9YzvMNWfi_5eVIwIJHWGAGR2jjgDC3juf5l3TuJeX2uKzkr04C9kNmYKa0vi0F0YK-O461DUrhEp1m0-s-KMQPzaQNRS0cuI53c6N-8nhnL04=s1280';

    const fetchClassAndMaterial = async () => {
        try {
            const { signer } = contractRef.current;
            const bigIntId = parseBigInt(id - 0);
            const contractInstance = await createContractInstance(signer);
            if(!loaded.classRoom) {
                const class_data = await contractInstance.getClass(bigIntId);
                const parsed_data = parseJSONStringData(class_data);
                if(!parsed_data?.name) throw new Error(classRoomError);
                setClassRoom(parsed_data);
                setLoaded({ ...loaded, classRoom: true });
            }
            if(loaded.materials) {
                const material_data = materials.find(val => val._id == material_id);
                if(!material_data) throw new Error(materialError); 
                setMaterial(material_data);
            } else {
                const material_data = parseStringData(await contractInstance.getMaterialByIndex(bigIntId, parseBigInt(material_id - 0)));
                if(!material_data.main_title && !material.title) throw new Error(materialError); 
                setMaterial(material_data);
            }
            setLoading(false);
        } catch (err) {
            // console.log(err);
            if(err.message === classRoomError || err.message === materialError) throw new Error(err.message);
            throw new Error(true);
        }
    };

    const fetchMaterials = async (throw_allowed = true) => {
        if(!loaded.materials && !materialsLoading) setMaterialsLoading(true);
        try {
            // we would for sure have had contract data in ref state
            const { signer } = contractRef.current;
            const bigIntId = parseBigInt(id - 0);
            const contractInstance = await createContractInstance(signer);
            const last_index = await contractInstance.getMaterialLastIndex(bigIntId);
            const data = [];
            for(let index = 0; index <= last_index; index++) {
                const material_data = await contractInstance.getMaterialByIndex(bigIntId, parseBigInt(index));
                const parsed_data = parseStringData(material_data);
                if(!parsed_data.main_title && !parsed_data.title) continue;
                data.push({ _id: index, ...parsed_data });
            }
            data.reverse();
            setMaterials(data);
            setLoaded({ ...loaded, materials: true });
            setMaterialsLoading(false);
        } catch (err) {
            // console.log(err);
            if(throw_allowed) throw new Error('materials');
            else { setError('materials'); setMaterialsLoading(false); }
        }
    };
    
    const fetchData = async () => {
        // because class room and material are fetched together dont do if(!loaded.classroom)
        // let it load, if data is there, then it will be very fast that loading will almost not show
        setLoading(true);
        setMaterialsLoading(true);
        setError(false);
        try {
            if(!contractRef.current.signer) return setError(true);
            await fetchClassAndMaterial().catch(err => { throw new Error(err.message) });
            await fetchMaterials().catch(err => { throw new Error(err.message) });
        } catch (err) {
            // console.log(err);
            setError(err.message);
            setLoading(false);
            setMaterialsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // materials data would have been loaded already
        // this is mainly for clicking on a material in the side
        // because since we are still in the same page
        // navigation would not trigger remount and so useEffect with [] would not run
        // we have to listen for it ourself with this useEffect and below code
        // do not remove or touch
        if(loaded.materials && material_id) {
            const material_data = materials.find(val => val._id == material_id);
            setMaterial(material_data || {});
        }
    }, [material_id, loaded?.materials]);

    useEffect(() => {
        // no need to listen for material_id here cus material_content would have changed
        if(contentRef.current) contentRef.current.innerHTML = `<span>${material.content||''}</span>`;
    }, [material.content, loading]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`${FRONTEND_URL}/app/class/${id}/${material_id}`);
            setMessageFn(setMessage, { status: 'success', message: 'Link copied.' });
        } catch (err) {
            setMessageFn(setMessage, { status: 'error', message: 'Failed to copy.' });
        }
    };

    return (
        <div className="ClassRoom">
            {
                (error && error !== 'materials') ?

                <div className='class-room'>
                    <div className='class-room-error'>
                        <ErrorPage text={error === classRoomError ? error : ''} important={true} 
                        btnName={error !== true ? `Go back to ${error === classRoomError ? 'Home' : 'Class'} page.` : ''}
                        refreshFn={() => {
                            if(error === classRoomError) return navigate('/app');
                            if(error === materialError) return navigate(`/app/class/${id}`);
                            fetchData();
                        }} setContractRef={(val) => contractRef.current = val} />
                    </div>
                </div> :

                <div className="class-room">
                    <div className='cr-home'>
                        <div className="cr-back-back cursor" onClick={() => navigate(`/app`)}>
                            <div><MdOutlineKeyboardDoubleArrowLeft className="cgh-icon" /></div>
                        </div>
                        <div className="cr-go-home cursor" onClick={() => navigate(`/app/class/${id}`)}>
                            <MdOutlineArrowBack className="cgh-icon" />
                        </div>
                    </div>
                    <div className="cr-header">
                        {
                            loading ?
                            <div className="cr-header- material-cr">
                                <div className="crh-banner skeleton-loading"><Skeleton /></div>
                            </div>
                            :
                            <div className={`cr-header- ${classRoom.img_url ? true : false} material-cr`}>
                                <div className="crh-banner" style={{backgroundImage: `url("${classRoom.img_url}")`}}></div>
                                <div className='crh-txt'>
                                    <h3>{classRoom.name}</h3>
                                    <span>{classRoom.topic}</span>
                                </div>
                            </div>
                        }
                    </div>

                    <div className='Material'>
                        <div className='Material-'>
                            {
                                loading ?
                                <div className="crm-routers">
                                    <div>
                                        <div className='crmr crmr-skeleton'><Skeleton /></div>
                                        <div className='crmr crmr-skeleton'><Skeleton /></div>
                                    </div>
                                </div>
                                :
                                <div className="crm-routers">
                                    <div>
                                        <div className={`crmr ${route === 'Material' ? true : false}`}
                                        onClick={() => setRoute('Materail')}>Material</div>
                                        <div className={`crmr ${route === 'Materials' ? true : false}`}
                                        onClick={() => setRoute('Materials')}>Materials</div>
                                    </div>
                                </div>
                            }

                            <div className='material'>

                                {
                                    loading ?

                                    <MaterialLoading />
                                    :
                                    <div className={`material-main ${route === 'Material' ? true : false}`}>
                                        <div className={`mm-header`}>
                                            {contract.isAdmin && <div className='mmh-create-material'>
                                                <h3>Material</h3>
                                                <div className='mmh-create cursor' onClick={() => setModal(true)}>Modify Material</div>
                                            </div>}

                                            <div className='mmh-top'>
                                                <h3>{material.main_title||material.title}</h3>
                                                <div className='mm-right'>
                                                    <div className="crml-copy cursor" onClick={() => handleCopy()}>
                                                        <div className={`copy-txt`}>Copy link</div>
                                                        <MdContentCopy className="crml-copy-icon" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='mmh'>
                                                <span>
                                                    {
                                                        formatDate(material.createdAt) + '' +
                                                        (material.edited ? `, Edited ${formatDate(material.edited)}` : '')
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <div className='mm-content'>
                                            <div className='preview-content-link-wrapper'>
                                                <div className='preview-content-link'>
                                                    <Previewer data={material.site ? material : 
                                                        { 
                                                            title: material.link.split('://')[1]?.split('.')[0], 
                                                            site: material.link, link: material.link 
                                                        }
                                                    } />
                                                </div>
                                            </div>
                                            <div className='mmc' ref={contentRef}></div>
                                        </div>
                                    </div>
                                }

                                <div className={`Materials ${route === 'Materials' ? true : false}`}>
                                    <h3>Other materials from this class</h3>
                                    <div className='materials-div'>
                                        {
                                            error === 'materials' ?

                                            <div className='materials-div-error true'>
                                                <div className='crmcM-error'>
                                                    <ErrorPage text={''} btnName={'Retry'} refreshFn={() => fetchMaterials(false)} />
                                                </div>
                                            </div> :

                                            materialsLoading === true ?

                                            <div className='md-loading'>
                                                <LoadingSpinner width={'40px'} height={'40px'} />
                                            </div> :

                                            (
                                                materials.length === 0 ?
                                                <div className='md-no-data'>
                                                    <NoData text={'No materials posted for this class'} />
                                                </div> 
                                                :
                                                <ul className='materials-lists'>
                                                    {materials.map((val, idx) => (
                                                        <li key={`mats-${idx}`} className='material-li cursor'
                                                        onClick={() => navigate(`/app/class/${id}/${val._id}`)}>
                                                            <MdOutlineAssignment className="ml-icon" />
                                                            <span>{val.main_title||val.title}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
            {modal && <ModifyMaterial closeModal={() => setModal(false)} material={material} 
            material_id={material_id} setMaterials={setMaterials} id={id} />}
        </div>
    );
};

export default ClassRoomMaterial;