import Skeleton from '../../components/skeleton';
import './class.css';
import './loading.css';

const MaterialLoading = () => {

    return (
        <div className='MaterialsLoading'>
            <div className={`material-main true`}>
                <div className={`mm-header`}>
                    <div className='mmh-top'>
                        <div className='mmht-h3-skeleton'><Skeleton /></div>
                        <div className='mm-right'>
                            <div className="crml-copy">
                                <Skeleton />
                            </div>
                        </div>
                    </div>
                    <div className='mmh sk-loading'>
                        <div className='mmh-skeleton'><Skeleton /></div>
                    </div>
                </div>

                <div className='mm-content'>
                    <div className='preview-content-link skeleton-loading'>
                        <Skeleton />
                    </div>
                    <div className='mmc skeleton-loading'><Skeleton /></div>
                </div>
            </div>
        </div>
    );
};

export default MaterialLoading;