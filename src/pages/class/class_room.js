import { useNavigate, useParams } from 'react-router-dom';
import './class.css';
import './loading.css';
import { useContext, useEffect, useRef, useState } from 'react';
import { createContractInstance, formatDate, parseJSONStringData, parseStringData, setMessageFn } from '../../utils';
import { FRONTEND_URL } from '../../config';
import { AppContext } from '../../components/context';
import { MdContentCopy, MdOutlineArrowBack, MdOutlineAssignment } from 'react-icons/md';
import Skeleton from '../../components/skeleton';
import { ClassRoomLoading, LoadingAllMaterials } from './classroom_loading';
import ErrorPage from '../../components/error';
import NoData from '../../components/nodata';
import CreateMaterial from '../modals/createMaterial';

const ClassRoomMain = ({ classRoom, materials, setClassRoom, setMaterials, loaded, setLoaded }) => {

    const { contract, setMessage } = useContext(AppContext);
    const contractRef = useRef(contract);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [modal, setModal] = useState(false);
    const [materialsLoading, setMaterialsLoading] = useState(false);
    const [route, setRoute] = useState('About');
    const loadedRef = useRef(loaded);
    const navigate = useNavigate();
    const { id } = useParams();
    const classRoomError = 'No Class like this';

    const fetchClassRoom = async () => {
        try {
            const { signer } = contractRef.current;
            const contractInstance = await createContractInstance(signer);
            if(!loaded.classRoom) {
                const class_data = await contractInstance.getClass(id - 0);
                // console.log('cl_data', class_data);
                const parsed_data = parseJSONStringData(class_data);
                // console.log('parsed_class_data', parsed_data);
                if(!parsed_data?.name) throw new Error(classRoomError);
                setClassRoom(parsed_data);
                setLoaded({ ...loaded, classRoom: true });
                loadedRef.current = { ...loadedRef.current, classRoom: true };
            }
            setLoading(false);
        } catch(err) {
            // console.log(err);
            if(err.message === classRoomError) throw new Error(err.message);
            throw new Error('class-room');
        }
    };

    const fetchMaterials = async (throw_allowed = true) => {
        if(!loaded.materials && !materialsLoading) setMaterialsLoading(true);
        try {
            // we would for sure have had contract data in ref state
            const { signer } = contractRef.current;
            const contractInstance = await createContractInstance(signer);
            const last_index = await contractInstance.getMaterialLastIndex(id - 0);
            const data = [];
            for(let index = 0; index <= last_index; index++) {
                const material_data = await contractInstance.getMaterialByIndex(id - 0, index);
                // console.log('single material data', material_data);
                const parsed_data = parseStringData(material_data);
                // console.log('single material data parsed', parsed_data);
                if(!parsed_data.main_title && !parsed_data.title) continue;
                data.push({ _id: index, ...parsed_data });
            }
            data.reverse();
            setMaterials(data);
            setLoaded({ ...loaded, materials: true });
            loadedRef.current = { ...loadedRef.current, materials: true };
            setMaterialsLoading(false);
        } catch (err) {
            // console.log(err);
            if(throw_allowed) throw new Error('materials');
            else { setError('materials'); setMaterialsLoading(false); }
        }
    };

    const fetchData = async () => {
        if(!loaded.classRoom) setLoading(true);
        if(!loaded.materials) setMaterialsLoading(true);
        setError(false);
        try {
            if(!contractRef.current.signer) return setError(true);
            await fetchClassRoom().catch(err => { throw new Error(err.message) });
            await fetchMaterials().catch(err => { throw new Error(err.message) });
        } catch (err) {
            // no need to check for contract.signer as we see it is handled above already
            // if we have not loaded any data on classRoom AND materials should error page show
            // else we know we have data that can just be as placeholder
            // but user will be alerted that there is network error, as seen below with setMessageFn
            if(!loadedRef.current?.classRoom && !loadedRef.current?.materials) {
                setError(err.message);
            }
            setMessageFn(setMessage, { status: 'error', message: 'There was an error. Check internet' });
            setLoading(false);
            setMaterialsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleClick = async (e, val) => {
        if(e.target.classList.value.includes('crml-copy')) {
            try {
                await navigator.clipboard.writeText(`${FRONTEND_URL}/app/class/${id}/${val._id}`);
                setMessageFn(setMessage, { status: 'success', message: 'Link copied.' });
            } catch (err) {
                setMessageFn(setMessage, { status: 'error', message: 'Failed to copy.' });
            }
        } else navigate(`/app/class/${id}/${val._id}`);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`${FRONTEND_URL}/app/class/${id}`);
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
                        <ErrorPage text={error === classRoomError ? error : ''} 
                        important={true} btnName={error === classRoomError ? 'Go to Home.' : ''}
                        refreshFn={() => {
                            if(error === classRoomError) return navigate('/app');
                            fetchData();
                        }} setContractRef={(val) => contractRef.current = val} />
                    </div>
                </div> :

                <div className="class-room">
                    <div className='cr-home'>
                        <div className="cr-go-home cursor" onClick={() => navigate('/app')}>
                            <MdOutlineArrowBack className="cgh-icon" />
                        </div>
                    </div>
                    <div className="cr-header">
                        {
                            loading ?
                            <div className="cr-header-">
                                <div className="crh-banner skeleton-loading"><Skeleton /></div>
                            </div>
                            :
                            <div className={`cr-header- ${classRoom.img_url ? true : false}`}>
                                <div className={`crh-banner`}style={{backgroundImage: `url("${classRoom.img_url}")`}}></div>

                                <div className='crh-txt'>
                                    <h3>{classRoom.name}</h3>
                                    <span>{classRoom.topic}</span>
                                </div>
                            </div>
                        }
                    </div>
                    <div className="cr-main">
                        <div className="cr-main-">
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
                                    <div className={`crmr ${route === 'About' ? true : false}`}
                                    onClick={() => setRoute('About')}>About</div>
                                    <div className={`crmr ${route === 'Materials' ? true : false}`}
                                    onClick={() => setRoute('Materials')}>Materials</div>
                                </div>
                                </div>
                            }

                            <div className="crm-contents">
                                <div className={`crmc-About ${route === 'About' ? true : false}`}>
                                    {
                                        loading ?

                                        <ClassRoomLoading /> :

                                        <div className="crmA">
                                            <div className="crmA- class-Name">
                                                <div className='cln-copy'>
                                                    <div className="crml-copy cursor" onClick={() => handleCopy()}>
                                                        <div className={`copy-txt`}>Copy class link</div>
                                                        <MdContentCopy className="crml-copy-icon" />
                                                    </div>
                                                </div>
                                                <span className="crma-subtopic">CLASS NAME</span>
                                                <span className="crma-content">{classRoom.name}</span>
                                            </div>
                                            <div className="crmA-">
                                                <span className="crma-subtopic">TOPIC</span>
                                                <span className="crma-content">{classRoom.topic || ''}</span>
                                            </div>
                                            <div className="crmA-">
                                                <span className="crma-subtopic">DESCRIPTION</span>
                                                <span className="crma-content crma-desc">{classRoom.description}</span>
                                            </div>
                                            <div className="crmA-">
                                                <span className="crma-subtopic">CREATED BY</span>
                                                <span className="crma-content crma-desc">{classRoom.creator}</span>
                                            </div>
                                            <div className="crmA-">
                                                <span className="crma-subtopic">CREATED</span>
                                                <span className="crma-content crma-date">{formatDate(classRoom.created_at)}</span>
                                            </div>
                                        </div>
                                    }
                                </div>

                                {
                                    error === 'materials' ?

                                    <div className='crmc-Materials true'>
                                        <div className='crmcM-error'>
                                            <ErrorPage text={''} btnName={'Retry'} refreshFn={() => fetchMaterials(false)} />
                                        </div>
                                    </div> :

                                    materialsLoading ?

                                    <LoadingAllMaterials /> :

                                    <div className={`crmc-Materials ${route === 'Materials' ? true : false}`}>

                                        {contract.isAdmin && <div className='crmc-create-material'>
                                            <h3>Add new Material</h3>
                                            <div className='crmc-create cursor' onClick={() => setModal(true)}>Create Material</div>
                                        </div>}

                                        {
                                            materials.length === 0 ?

                                            <div className='crmc-no-data'>
                                                <NoData text={'No material posted for this class'} />
                                            </div> :
                                            
                                            <ul>
                                                {materials.map((val, idx) => (
                                                    <li className="crmM-li cursor" key={`crm-${idx}`} onClick={(e) => handleClick(e, val)}>
                                                        <div className="crml">
                                                            <div className="crml-icon-div">
                                                                <MdOutlineAssignment className="crml-icon" />
                                                            </div>
                                                            <div className="crml-txt">
                                                                <span className="crmlt-name">{val.main_title||val.title}</span>
                                                                <span className="crmlt-date">{formatDate(val.createdAt)}</span>
                                                            </div>
                                                            <div className="crml-copy">
                                                                <div className={`copy-txt`}>Copy link</div>
                                                                <MdContentCopy className="crml-copy-icon" />
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        }
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            }
            {modal && <CreateMaterial closeModal={() => setModal(false)} id={id} setMaterials={setMaterials} />}
        </div>
    );
};

export default ClassRoomMain;