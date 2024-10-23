import { useRef, useEffect } from 'react';
import './styles.css';

const Previewer = ({ data }) => {

    const imageRef = useRef();

    const loadError = () => {
        imageRef.current.style.display = 'none';
    };

    useEffect(() => {
        if(imageRef.current) imageRef.current.addEventListener('error', loadError);
        
        return () => {
            if(imageRef.current) imageRef.current.removeEventListener('error', loadError);
        }
    }, []);

    return (
        <div className='Previewer'>
            <div className='Image'>
                {data.img && <img src={data.img} ref={imageRef} alt={data.img} />}
                <a className='image-txt cursor' href={data.link} target='_blank'>
                    <span className='image-pTag'>{data.title}</span>
                    {data.pTag && <span className='image-desc'>{data.pTag}</span>}
                    <span className='image-url'>{data.site}</span>
                </a>
            </div>
        </div>
    );
};

export default Previewer;