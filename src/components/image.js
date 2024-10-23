import { useEffect, useRef, useState } from 'react';
import image from '../dapps logo.jpg';
import './styles.css';

const Image = ({ src }) => {

    const imageRef = useRef();
    const [imageSrc, setImageSrc] = useState(src||image);
    const [isLoaded, setisLoaded] = useState(false);

    const imageLoaded = () => {
        setisLoaded(true);
    }

    const loadError = () => {
        console.log('error');
        setisLoaded('error');
        setImageSrc(image);
    }

    useEffect(() => {
        if(imageRef.current) {
            imageRef.current.addEventListener('load', imageLoaded);
            imageRef.current.addEventListener('error', loadError);
        }
        return () => {
            if(imageRef.current) {
                imageRef.current.removeEventListener('load', imageLoaded);
                imageRef.current.removeEventListener('error', loadError);
            }
        }
    });

    return (
        <div className='Image'>
            <img src={imageSrc} ref={imageRef} alt={src} />
        </div>
    )
};

export default Image;