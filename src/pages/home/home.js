import { useState, useEffect, useContext, useRef } from "react";
import './home.css';
import HomeLoading from "./homeloading";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../components/context";
import CreateClass from "../modals/createClass";
import { createContractInstance, parseJSONStringData, setMessageFn } from "../../utils";
import ErrorPage from "../../components/error";
import NoData from "../../components/nodata";

// console.log(image)
const image = 'https://lh3.googleusercontent.com/hr_crs_themes/ACP_IjEUeuVRrv9YzvMNWfi_5eVIwIJHWGAGR2jjgDC3juf5l3TuJeX2uKzkr04C9kNmYKa0vi0F0YK-O461DUrhEp1m0-s-KMQPzaQNRS0cuI53c6N-8nhnL04=s1280';

const Home = () => {

    const { contract, classRooms, setClassRooms, setMessage } = useContext(AppContext);
    const contractRef = useRef(contract);
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [classes, setClasses] = useState([]);
    const [classesShowing, setClassesShowing] = useState([]);

    const navigate = useNavigate();

    const fetchClasses = async () => {
        // use length, if no length then just make loading appear, its all a sharade
        if(classRooms.length === 0) setLoading(true);
        setError(false);

        try {
            const { signer } = contractRef.current || {};
            if(!signer) throw new Error('No wallet connected');
            const contractInstance = await createContractInstance(signer);
            const last_index = await contractInstance.getLastIndex();
            // console.log('lst', last_index);
            const data = [];
            for(let index = 0; index <= last_index; index++) {
                const class_data = await contractInstance.getClass(index - 0);
                // console.log('class', class_data, 'class_index', index);
                const parsed_data = parseJSONStringData(class_data);
                // console.log('class_parsed', parsed_data);
                if(!parsed_data.name) continue;
                data.push({ _id: index, ...parsed_data });
            }
            data.reverse();
            setClassRooms(data);
            setClasses(data);
            setClassesShowing(data);
            setLoading(false);
        } catch (err) {
            // console.log(err);
            // if classRooms length > 0 we know we have data that can just be as placeholder
            // but user will be alerted that there is network error, as seen below with setMessageFn
            if(classRooms.length === 0) setError(true);
            setMessageFn(setMessage, { status: 'error', message: 'There was an error. Check internet' });
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        setClassesShowing(classRooms);
    }, [classRooms.length]);

    return (
        <div className="Home">
            {
                error ?

                <ErrorPage text={'Error fetching classes data'} 
                refreshFn={() => fetchClasses()} setContractRef={(val) => contractRef.current = val} /> :

                loading ? 

                <HomeLoading /> :

                <div className="home-main">
                    {contract.isAdmin && <div className="hm">
                        <h3>All Classes</h3>
                        <div className="create-class cursor" onClick={() => setModal(true)}>Create new class</div>
                    </div>}
                    {
                        classesShowing.length === 0 ?

                        <NoData text={'No class created yet'} /> :

                        <ul>
                            {classesShowing.map((val, idx) => (
                                <li key={`classes-${idx}`} className="class-li cursor" onClick={() => navigate(`/app/class/${val._id}`)}>
                                    <div className='cli-image-with-h3'>
                                        <div className="cli-image" style={{backgroundImage: `url("${val.img_url}")`}}></div>
                                        <div className="cli-abs"></div>
                                        <div className='cli-txt'>
                                            <h3>{val.name}</h3>
                                            <span>{val.topic}</span>
                                        </div>
                                    </div>
                                    <div className="cli-desc">
                                        <span>{val.description}</span>
                                    </div>
                                </li>
                            ))}
                            {/* padded is tested and accurate across all window sizes, do not delete */}
                            <li className='class-li padded'></li>
                            <li className='class-li padded'></li>
                        </ul>
                    }
                </div>
            } 

            {modal && <CreateClass closeModal={() => setModal(false)} />}
        </div>
    );
};

export default Home;