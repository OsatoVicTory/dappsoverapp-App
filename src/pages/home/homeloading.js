import Skeleton from "../../components/skeleton";
import './home.css';

const HomeLoading = () => {

    const dummy = Array(21).fill(0);
    return (
        <div>
            <div className="home-main">
                <div className="hm">
                    <div className="hm-h3"><Skeleton /></div>
                    <div className="create-class sk-loading"><Skeleton /></div>
                </div>
                <ul>
                    {dummy.map((val, idx) => (
                        <li key={`classes-${idx}`} className="class-li">
                            <div className='cli-image-with-h3'>
                                <div className="cli-image"><Skeleton /></div>
                            </div>
                            <div className="cli-desc sk-loading">
                                <div><Skeleton /></div>
                                <div><Skeleton /></div>
                                <div><Skeleton /></div>
                            </div>
                        </li>
                    ))}
                    {/* padded is tested and accurate across all window sizes, do not delete */}
                    <li className='class-li padded'></li>
                    <li className='class-li padded'></li>
                </ul>
            </div>
        </div>
    );
};

export default HomeLoading;