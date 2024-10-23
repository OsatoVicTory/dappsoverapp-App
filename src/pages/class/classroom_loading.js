import './loading.css';
import Skeleton from '../../components/skeleton';

export const ClassRoomLoading = () => {

    return (
        <div className="crmA">
            <div className="crmA- class-Name">
                <div className="crma-subtopic crmas-loading"><Skeleton /></div>
                <div className="crma-content crmas-loading"><Skeleton /></div>
            </div>
            <div className="crmA-">
                <div className="crma-subtopic crmas-loading"><Skeleton /></div>
                <div className="crma-content crmas-loading"><Skeleton /></div>
            </div>
            <div className="crmA-">
                <div className="crma-subtopic crmas-loading"><Skeleton /></div>
                <div className="crma-content crma-desc crmas-loading"><Skeleton /></div>
                <div className="crma-content crma-desc crmas-loading"><Skeleton /></div>
                <div className="crma-content crma-desc crmas-loading"><Skeleton /></div>
            </div>
            <div className="crmA-">
                <div className="crma-subtopic crmas-loading"><Skeleton /></div>
                <div className="crma-content crmas-loading"><Skeleton /></div>
            </div>
            <div className="crmA-">
                <div className="crma-subtopic crmas-loading"><Skeleton /></div>
                <div className="crma-content crmas-loading"><Skeleton /></div>
            </div>
        </div>
    );
};

export const LoadingAllMaterials = () => {

    const dummy = Array(6).fill(0);

    return (
        <div className={`crmc-Materials true`}>
            <ul>
                {dummy.map((val, idx) => (
                    <li className="crmM-li" key={`crm-${idx}`}>
                        <div className="crml">
                            <div className="crml-icon-div crmlid-loading">
                                <Skeleton />
                            </div>
                            <div className="crml-txt">
                                <div className="crmlt-name crmlt-loading"><Skeleton /></div>
                                <div className="crmlt-date crmlt-loading"><Skeleton /></div>
                            </div>
                            <div className="crml-copy crmlc-loading">
                                <Skeleton />
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div> 
    );
};